
#!/bin/bash
# Debian系统安装和配置脚本
# 使用方法: sudo bash setup.sh

set -e

echo "开始配置换热器参数表单Python后端服务器..."

# 检查是否以root权限运行
if [[ $EUID -ne 0 ]]; then
   echo "此脚本需要root权限运行" 
   exit 1
fi

# 获取当前脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 更新系统包
echo "更新系统包..."
apt update && apt upgrade -y

# 安装Python和相关工具
echo "安装Python和相关工具..."
apt install -y python3 python3-pip python3-venv nginx sqlite3 certbot python3-certbot-nginx curl wget git htop

# 创建应用用户
echo "创建应用用户..."
if ! id "heatex" &>/dev/null; then
    useradd -m -s /bin/bash heatex
fi

# 创建应用目录
echo "创建应用目录..."
mkdir -p /var/lib/heat_exchanger
mkdir -p /var/log/heat_exchanger
mkdir -p /var/www/heat-exchanger
mkdir -p /var/backups/heat_exchanger
chown -R heatex:heatex /var/lib/heat_exchanger
chown -R heatex:heatex /var/log/heat_exchanger
chown -R heatex:heatex /var/www/heat-exchanger
chown -R heatex:heatex /var/backups/heat_exchanger

# 复制应用文件
echo "复制应用文件..."
cp -r "$PROJECT_DIR"/* /var/www/heat-exchanger/
chown -R heatex:heatex /var/www/heat-exchanger

# 创建Python虚拟环境
echo "创建Python虚拟环境..."
cd /var/www/heat-exchanger
sudo -u heatex python3 -m venv venv
sudo -u heatex venv/bin/pip install --upgrade pip
sudo -u heatex venv/bin/pip install -r requirements.txt

# 生成安全的API密钥
API_KEY=$(openssl rand -hex 32)
echo "生成的API密钥: $API_KEY"

# 设置环境变量
echo "设置环境变量..."
cat > /var/www/heat-exchanger/.env << EOF
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=$(openssl rand -hex 32)
API_KEY=$API_KEY
DB_PATH=/var/lib/heat_exchanger/requests.db
LOG_LEVEL=INFO
ALLOWED_ORIGINS=["https://your-domain.pages.dev", "http://localhost:3000", "https://localhost:3000"]
EOF

chown heatex:heatex /var/www/heat-exchanger/.env
chmod 600 /var/www/heat-exchanger/.env

# 创建systemd服务
echo "创建systemd服务..."
cat > /etc/systemd/system/heat-exchanger.service << EOF
[Unit]
Description=Heat Exchanger Form Backend
After=network.target

[Service]
Type=simple
User=heatex
Group=heatex
WorkingDirectory=/var/www/heat-exchanger
Environment=PATH=/var/www/heat-exchanger/venv/bin
EnvironmentFile=/var/www/heat-exchanger/.env
ExecStart=/var/www/heat-exchanger/venv/bin/python app.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=heat-exchanger

[Install]
WantedBy=multi-user.target
EOF

# 配置Nginx
echo "配置Nginx..."
# 备份原配置
if [ -f /etc/nginx/sites-enabled/default ]; then
    mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup
fi

cp /var/www/heat-exchanger/config/nginx.conf /etc/nginx/sites-available/heat-exchanger
ln -sf /etc/nginx/sites-available/heat-exchanger /etc/nginx/sites-enabled/

# 测试Nginx配置
nginx -t

# 设置防火墙
echo "配置防火墙..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 获取SSL证书
echo "获取SSL证书..."
# 首先启动nginx以进行域名验证
systemctl start nginx
sleep 5

# 使用certbot获取SSL证书
certbot --nginx -d 106.14.94.111 --non-interactive --agree-tos --email admin@your-domain.com --redirect

# 启动服务
echo "启动服务..."
systemctl daemon-reload
systemctl enable heat-exchanger
systemctl start heat-exchanger
systemctl restart nginx

# 设置日志轮转
echo "配置日志轮转..."
cat > /etc/logrotate.d/heat-exchanger << EOF
/var/log/heat_exchanger/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 heatex heatex
    postrotate
        systemctl reload heat-exchanger
    endscript
}

/var/log/nginx/heat_exchanger_*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# 创建监控脚本
echo "创建监控脚本..."
cat > /usr/local/bin/monitor-heat-exchanger.sh << 'EOF'
#!/bin/bash
# 监控脚本

SERVICE_NAME="heat-exchanger"
LOG_FILE="/var/log/heat_exchanger/monitor.log"

# 确保日志目录存在
mkdir -p /var/log/heat_exchanger

check_service() {
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo "$(date): $SERVICE_NAME is running" >> $LOG_FILE
        return 0
    else
        echo "$(date): $SERVICE_NAME is not running, restarting..." >> $LOG_FILE
        systemctl restart $SERVICE_NAME
        sleep 5
        if systemctl is-active --quiet $SERVICE_NAME; then
            echo "$(date): $SERVICE_NAME restarted successfully" >> $LOG_FILE
        else
            echo "$(date): Failed to restart $SERVICE_NAME" >> $LOG_FILE
        fi
        return 1
    fi
}

check_disk_space() {
    USAGE=$(df /var/lib/heat_exchanger | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $USAGE -gt 80 ]; then
        echo "$(date): Disk usage is ${USAGE}%, cleaning up..." >> $LOG_FILE
        # 清理30天前的日志
        find /var/log/heat_exchanger -name "*.log" -mtime +30 -delete
        # 清理旧备份
        find /var/backups/heat_exchanger -name "*.gz" -mtime +7 -delete
    fi
}

check_memory() {
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $MEMORY_USAGE -gt 90 ]; then
        echo "$(date): Memory usage is ${MEMORY_USAGE}%, restarting service..." >> $LOG_FILE
        systemctl restart heat-exchanger
    fi
}

check_service
check_disk_space
check_memory
EOF

chmod +x /usr/local/bin/monitor-heat-exchanger.sh

# 添加定时任务
echo "添加定时任务..."
# 清理现有crontab
crontab -l 2>/dev/null | grep -v "monitor-heat-exchanger\|backup-heat-exchanger" | crontab -

# 添加新的定时任务
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-heat-exchanger.sh") | crontab -

# 创建备份脚本
echo "创建备份脚本..."
cat > /usr/local/bin/backup-heat-exchanger.sh << 'EOF'
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="/var/backups/heat_exchanger"
DB_PATH="/var/lib/heat_exchanger/requests.db"
DATE=$(date +%Y%m%d_%H%M%S)

# 确保备份目录存在
mkdir -p $BACKUP_DIR

# 备份数据库
if [ -f "$DB_PATH" ]; then
    # 创建数据库备份
    sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/requests_$DATE.db"
    
    # 压缩备份
    gzip "$BACKUP_DIR/requests_$DATE.db"
    
    # 保留最近30天的备份
    find $BACKUP_DIR -name "requests_*.db.gz" -mtime +30 -delete
    
    echo "$(date): Database backup completed: requests_$DATE.db.gz" >> /var/log/heat_exchanger/backup.log
else
    echo "$(date): Database file not found: $DB_PATH" >> /var/log/heat_exchanger/backup.log
fi

# 备份配置文件
CONFIG_BACKUP_DIR="$BACKUP_DIR/config_$DATE"
mkdir -p "$CONFIG_BACKUP_DIR"
cp -r /var/www/heat-exchanger/.env "$CONFIG_BACKUP_DIR/"
cp -r /etc/nginx/sites-available/heat-exchanger "$CONFIG_BACKUP_DIR/"
cp -r /etc/systemd/system/heat-exchanger.service "$CONFIG_BACKUP_DIR/"

tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" -C "$BACKUP_DIR" "config_$DATE"
rm -rf "$CONFIG_BACKUP_DIR"

# 保留最近7天的配置备份
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-heat-exchanger.sh

# 添加备份定时任务 (每天凌晨2点)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-heat-exchanger.sh") | crontab -

# 创建健康检查脚本
echo "创建健康检查脚本..."
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
# 健康检查脚本

LOG_FILE="/var/log/heat_exchanger/health.log"
API_URL="https://106.14.94.111/api/health"

# 确保日志目录存在
mkdir -p /var/log/heat_exchanger

check_api() {
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" --max-time 10)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "$(date): API health check passed (HTTP $HTTP_CODE)" >> $LOG_FILE
        return 0
    else
        echo "$(date): API health check failed (HTTP $HTTP_CODE)" >> $LOG_FILE
        return 1
    fi
}

check_nginx() {
    if systemctl is-active --quiet nginx; then
        echo "$(date): Nginx is running" >> $LOG_FILE
        return 0
    else
        echo "$(date): Nginx is not running, restarting..." >> $LOG_FILE
        systemctl restart nginx
        return 1
    fi
}

check_api
check_nginx
EOF

chmod +x /usr/local/bin/health-check.sh

# 添加健康检查定时任务 (每10分钟)
(crontab -l 2>/dev/null; echo "*/10 * * * * /usr/local/bin/health-check.sh") | crontab -

# 创建日志分析脚本
echo "创建日志分析脚本..."
cat > /usr/local/bin/analyze-logs.sh << 'EOF'
#!/bin/bash
# 日志分析脚本

LOG_FILE="/var/log/heat_exchanger/requests.log"
ANALYSIS_FILE="/var/log/heat_exchanger/daily_analysis.log"
DATE=$(date +%Y-%m-%d)

# 确保日志目录存在
mkdir -p /var/log/heat_exchanger

if [ -f "$LOG_FILE" ]; then
    echo "=== Daily Analysis for $DATE ===" >> "$ANALYSIS_FILE"
    
    # 统计请求数量
    REQUEST_COUNT=$(grep -c "$DATE" "$LOG_FILE" 2>/dev/null || echo "0")
    echo "Total requests: $REQUEST_COUNT" >> "$ANALYSIS_FILE"
    
    # 统计成功请求
    SUCCESS_COUNT=$(grep "$DATE" "$LOG_FILE" | grep -c "提交成功" 2>/dev/null || echo "0")
    echo "Successful requests: $SUCCESS_COUNT" >> "$ANALYSIS_FILE"
    
    # 统计错误请求
    ERROR_COUNT=$(grep "$DATE" "$LOG_FILE" | grep -c "ERROR\|FAILED" 2>/dev/null || echo "0")
    echo "Failed requests: $ERROR_COUNT" >> "$ANALYSIS_FILE"
    
    # 统计IP访问次数
    echo "Top 10 IP addresses:" >> "$ANALYSIS_FILE"
    grep "$DATE" "$LOG_FILE" | grep -o "client_ip: [0-9.]*" | sort | uniq -c | sort -nr | head -10 >> "$ANALYSIS_FILE"
    
    echo "" >> "$ANALYSIS_FILE"
fi
EOF

chmod +x /usr/local/bin/analyze-logs.sh

# 添加日志分析定时任务 (每天23:55)
(crontab -l 2>/dev/null; echo "55 23 * * * /usr/local/bin/analyze-logs.sh") | crontab -

# 创建系统信息脚本
echo "创建系统信息脚本..."
cat > /usr/local/bin/system-info.sh << 'EOF'
#!/bin/bash
# 系统信息脚本

INFO_FILE="/var/log/heat_exchanger/system_info.log"
DATE=$(date +%Y-%m-%d_%H:%M:%S)

# 确保日志目录存在
mkdir -p /var/log/heat_exchanger

echo "=== System Information - $DATE ===" >> "$INFO_FILE"
echo "Uptime: $(uptime)" >> "$INFO_FILE"
echo "Memory usage:" >> "$INFO_FILE"
free -h >> "$INFO_FILE"
echo "" >> "$INFO_FILE"
echo "Disk usage:" >> "$INFO_FILE"
df -h >> "$INFO_FILE"
echo "" >> "$INFO_FILE"
echo "Service status:" >> "$INFO_FILE"
systemctl is-active heat-exchanger nginx >> "$INFO_FILE"
echo "" >> "$INFO_FILE"
echo "=============================" >> "$INFO_FILE"
echo "" >> "$INFO_FILE"
EOF

chmod +x /usr/local/bin/system-info.sh

# 添加系统信息定时任务 (每小时)
(crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/system-info.sh") | crontab -

# 创建安全加固脚本
echo "创建安全加固脚本..."
cat > /usr/local/bin/security-hardening.sh << 'EOF'
#!/bin/bash
# 安全加固脚本

LOG_FILE="/var/log/heat_exchanger/security.log"
DATE=$(date +%Y-%m-%d_%H:%M:%S)

# 确保日志目录存在
mkdir -p /var/log/heat_exchanger

echo "[$DATE] Starting security hardening..." >> "$LOG_FILE"

# 检查文件权限
echo "Checking file permissions..." >> "$LOG_FILE"
chmod 600 /var/www/heat-exchanger/.env
chmod 755 /var/www/heat-exchanger/app.py
chmod 644 /var/www/heat-exchanger/requirements.txt

# 检查SSH配置
if grep -q "^PermitRootLogin yes" /etc/ssh/sshd_config; then
    echo "WARNING: Root login is enabled" >> "$LOG_FILE"
fi

# 检查防火墙状态
if ufw status | grep -q "Status: active"; then
    echo "Firewall is active" >> "$LOG_FILE"
else
    echo "WARNING: Firewall is not active" >> "$LOG_FILE"
fi

# 检查SSL证书有效期
if [ -f "/etc/letsencrypt/live/106.14.94.111/cert.pem" ]; then
    EXPIRY=$(openssl x509 -in /etc/letsencrypt/live/106.14.94.111/cert.pem -noout -enddate | cut -d= -f2)
    echo "SSL certificate expires: $EXPIRY" >> "$LOG_FILE"
    
    # 如果证书在30天内过期，发送警告
    EXPIRY_TIMESTAMP=$(date -d "$EXPIRY" +%s)
    CURRENT_TIMESTAMP=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
    
    if [ $DAYS_LEFT -lt 30 ]; then
        echo "WARNING: SSL certificate expires in $DAYS_LEFT days" >> "$LOG_FILE"
    fi
fi

echo "[$DATE] Security hardening completed" >> "$LOG_FILE"
EOF

chmod +x /usr/local/bin/security-hardening.sh

# 添加安全检查定时任务 (每天)
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/security-hardening.sh") | crontab -

# 创建部署脚本
echo "创建部署脚本..."
cat > /usr/local/bin/deploy-heat-exchanger.sh << 'EOF'
#!/bin/bash
# 部署脚本

PROJECT_DIR="/var/www/heat-exchanger"
BACKUP_DIR="/var/backups/heat_exchanger"
DATE=$(date +%Y%m%d_%H%M%S)

echo "开始部署换热器参数表单后端..."

# 创建备份
echo "创建当前版本备份..."
if [ -d "$PROJECT_DIR" ]; then
    tar -czf "$BACKUP_DIR/deployment_backup_$DATE.tar.gz" -C "$(dirname "$PROJECT_DIR")" "$(basename "$PROJECT_DIR")"
    echo "备份已创建: $BACKUP_DIR/deployment_backup_$DATE.tar.gz"
fi

# 停止服务
echo "停止服务..."
systemctl stop heat-exchanger

# 更新代码 (这里可以添加git pull等操作)
echo "更新应用代码..."
# cd "$PROJECT_DIR"
# git pull origin main

# 安装依赖
echo "安装Python依赖..."
cd "$PROJECT_DIR"
sudo -u heatex venv/bin/pip install -r requirements.txt

# 运行数据库迁移 (如果需要)
echo "运行数据库迁移..."
# sudo -u heatex venv/bin/python migrate.py

# 启动服务
echo "启动服务..."
systemctl start heat-exchanger

# 检查服务状态
sleep 5
if systemctl is-active --quiet heat-exchanger; then
    echo "部署成功！服务正在运行"
else
    echo "部署失败！服务未启动"
    echo "查看日志: journalctl -u heat-exchanger -f"
    exit 1
fi

# 重启nginx
systemctl restart nginx

echo "部署完成！"
EOF

chmod +x /usr/local/bin/deploy-heat-exchanger.sh

# 显示当前crontab
echo "当前定时任务:"
crontab -l

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
systemctl status heat-exchanger --no-pager
systemctl status nginx --no-pager

# 测试API
echo "测试API..."
curl -k https://106.14.94.111/api/health || echo "API测试失败，请检查配置"

echo "=========================================="
echo "安装完成！"
echo "=========================================="
echo "服务信息:"
echo "  - API地址: https://106.14.94.111/api/health"
echo "  - 应用目录: /var/www/heat-exchanger"
echo "  - 日志目录: /var/log/heat_exchanger"
echo "  - 数据库: /var/lib/heat_exchanger/requests.db"
echo "  - 备份目录: /var/backups/heat_exchanger"
echo ""
echo "常用命令:"
echo "  - 查看服务状态: systemctl status heat-exchanger"
echo "  - 查看日志: journalctl -u heat-exchanger -f"
echo "  - 重启服务: systemctl restart heat-exchanger"
echo "  - 部署更新: /usr/local/bin/deploy-heat-exchanger.sh"
echo "  - 健康检查: /usr/local/bin/health-check.sh"
echo ""
echo "重要文件:"
echo "  - 环境变量: /var/www/heat-exchanger/.env"
echo "  - Nginx配置: /etc/nginx/sites-available/heat-exchanger"
echo "  - 服务配置: /etc/systemd/system/heat-exchanger.service"
echo ""
echo "请记得:"
echo "  1. 修改 /var/www/heat-exchanger/.env 中的 ALLOWED_ORIGINS"
echo "  2. 配置SSL证书的自动续期"
echo "  3. 定期检查日志和备份"
echo "  4. 监控系统资源使用情况"
echo "=========================================="
