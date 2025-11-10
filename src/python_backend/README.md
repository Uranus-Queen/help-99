
# 换热器参数表单 - Python后端服务器

这是一个安全的Python后端服务器，用于接收和处理来自Cloudflare Pages托管的换热器参数表单数据。

## 🚀 功能特性

### 安全特性
- **数据加密传输**: 前端数据加密后传输
- **API签名验证**: 防止数据篡改
- **CSRF防护**: 防止跨站请求伪造
- **XSS防护**: HTML转义防止脚本注入
- **请求频率限制**: 防止恶意请求
- **时间戳验证**: 防止重放攻击
- **CORS保护**: 限制跨域访问

### 系统特性
- **SQLite数据库**: 轻量级数据存储
- **Nginx反向代理**: 高性能Web服务器
- **SSL/TLS加密**: HTTPS安全传输
- **自动备份**: 定期数据备份
- **系统监控**: 实时健康检查
- **日志管理**: 完整的日志记录

## 📋 系统要求

- **操作系统**: Debian 10+ / Ubuntu 18.04+
- **Python**: 3.7+
- **内存**: 最低 512MB，推荐 1GB+
- **存储**: 最低 5GB 可用空间
- **网络**: 公网IP地址 (106.14.94.111)

## 🛠️ 安装部署

### 1. 快速安装

```bash
# 下载项目
git clone <repository-url>
cd python_backend

# 运行安装脚本
sudo bash scripts/setup.sh
```

### 2. 手动安装

```bash
# 1. 安装系统依赖
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx sqlite3

# 2. 创建应用用户
sudo useradd -m -s /bin/bash heatex

# 3. 创建目录
sudo mkdir -p /var/www/heat-exchanger
sudo mkdir -p /var/lib/heat_exchanger
sudo mkdir -p /var/log/heat_exchanger

# 4. 复制文件
sudo cp -r . /var/www/heat-exchanger/
sudo chown -R heatex:heatex /var/www/heat-exchanger

# 5. 安装Python依赖
cd /var/www/heat-exchanger
sudo -u heatex python3 -m venv venv
sudo -u heatex venv/bin/pip install -r requirements.txt

# 6. 配置环境变量
sudo -u heatex cp .env.example .env
# 编辑 .env 文件设置必要的环境变量

# 7. 配置Nginx
sudo cp config/nginx.conf /etc/nginx/sites-available/heat-exchanger
sudo ln -s /etc/nginx/sites-available/heat-exchanger /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 8. 配置SSL证书
sudo certbot --nginx -d 106.14.94.111

# 9. 启动服务
sudo systemctl enable heat-exchanger
sudo systemctl start heat-exchanger
sudo systemctl restart nginx
```

## ⚙️ 配置说明

### 环境变量 (.env)

```bash
# Flask配置
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# 安全配置
API_KEY=your-api-key-here
DB_PATH=/var/lib/heat_exchanger/requests.db
LOG_LEVEL=INFO

# CORS配置
ALLOWED_ORIGINS=["https://your-domain.pages.dev", "http://localhost:3000"]
```

### Nginx配置

主要配置文件: `/etc/nginx/sites-available/heat-exchanger`

- **SSL终端**: HTTPS加密传输
- **反向代理**: 请求转发到Python应用
- **安全头**: 防止各种Web攻击
- **频率限制**: 防止恶意请求

## 📊 API接口

### 健康检查

```http
GET /api/health
```

响应:
```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00Z",
    "version": "1.0.0"
}
```

### 提交表单数据

```http
POST /api/heat-exchanger/submit
Content-Type: application/json

{
    "encryptedData": "base64加密的数据",
    "signature": "API签名",
    "timestamp": "时间戳",
    "nonce": "随机数",
    "csrfToken": "CSRF令牌"
}
```

响应:
```json
{
    "code": 200,
    "message": "提交成功",
    "data": {
        "request_id": "uuid",
        "submitted_at": "2024-01-01T12:00:00Z"
    }
}
```

## 🔧 管理命令

### 服务管理

```bash
# 查看服务状态
sudo systemctl status heat-exchanger

# 启动服务
sudo systemctl start heat-exchanger

# 重启服务
sudo systemctl restart heat-exchanger

# 查看日志
sudo journalctl -u heat-exchanger -f
```

### 数据库管理

```bash
# 查看数据库
sqlite3 /var/lib/heat_exchanger/requests.db

# 备份数据库
sudo bash scripts/backup.sh

# 恢复数据库
sudo bash scripts/restore.sh backup_file.gz
```

### 监控脚本

```bash
# 完整监控检查
sudo bash scripts/monitor.sh

# 检查特定项目
sudo bash scripts/monitor.sh service
sudo bash scripts/monitor.sh api
sudo bash scripts/monitor.sh disk
```

## 📁 目录结构

```
python_backend/
├── app.py                 # 主应用文件
├── requirements.txt        # Python依赖
├── .env.example          # 环境变量模板
├── config/
│   └── nginx.conf        # Nginx配置
├── scripts/
│   ├── setup.sh          # 安装脚本
│   ├── backup.sh         # 备份脚本
│   ├── monitor.sh        # 监控脚本
│   └── deploy.sh         # 部署脚本
└── README.md             # 说明文档
```

## 🔒 安全考虑

### 数据保护
- 所有用户输入都经过HTML转义
- 敏感数据在传输前进行加密
- 数据库文件权限严格控制
- 定期自动备份重要数据

### 访问控制
- API签名验证防止数据篡改
- CSRF令牌防止跨站攻击
- 请求频率限制防止滥用
- CORS配置限制跨域访问

### 系统安全
- SSL/TLS加密传输
- 安全的HTTP头配置
- 定期安全更新
- 完整的日志记录

## 📈 监控和日志

### 日志文件位置
- **应用日志**: `/var/log/heat_exchanger/requests.log`
- **监控日志**: `/var/log/heat_exchanger/monitor.log`
- **备份日志**: `/var/log/heat_exchanger/backup.log`
- **Nginx日志**: `/var/log/nginx/heat_exchanger_*.log`

### 监控指标
- 服务运行状态
- API响应时间
- 系统资源使用
- 错误率统计
- 安全事件记录

## 🚨 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查日志
   sudo journalctl -u heat-exchanger -n 50
   
   # 检查配置
   sudo nginx -t
   ```

2. **API无法访问**
   ```bash
   # 检查端口
   sudo netstat -tlnp | grep :5000
   
   # 检查防火墙
   sudo ufw status
   ```

3. **数据库错误**
   ```bash
   # 检查数据库权限
   ls -la /var/lib/heat_exchanger/
   
   # 检查数据库完整性
   sqlite3 /var/lib/heat_exchanger/requests.db "PRAGMA integrity_check;"
   ```

### 性能优化

1. **数据库优化**
   - 定期清理旧数据
   - 添加适当索引
   - 优化查询语句

2. **Web服务器优化**
   - 启用Gzip压缩
   - 配置缓存策略
   - 调整worker进程数

## 📞 技术支持

如果遇到问题，请提供以下信息：
- 错误日志
- 系统版本
- 配置文件
- 重现步骤

## 📄 许可证

本项目采用 MIT 许可证。

---

**注意**: 在生产环境中，请务必：
1. 修改默认的密钥和密码
2. 配置适当的防火墙规则
3. 设置定期备份策略
4. 监控系统安全状态
5. 及时更新系统补丁
