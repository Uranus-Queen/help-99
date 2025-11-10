
#!/bin/bash
# 系统监控脚本

SERVICE_NAME="heat-exchanger"
LOG_FILE="/var/log/heat_exchanger/monitor.log"
ALERT_EMAIL="admin@your-domain.com"  # 修改为您的邮箱

# 确保日志目录存在
mkdir -p /var/log/heat_exchanger

# 发送邮件警报函数
send_alert() {
    local subject="$1"
    local message="$2"
    
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
        echo "$(date): 邮件警报已发送 - $subject" >> "$LOG_FILE"
    else
        echo "$(date): 邮件命令不可用，无法发送警报" >> "$LOG_FILE"
    fi
}

# 检查服务状态
check_service() {
    local service_status=$(systemctl is-active "$SERVICE_NAME")
    
    if [ "$service_status" = "active" ]; then
        echo "$(date): $SERVICE_NAME 服务运行正常" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): $SERVICE_NAME 服务异常，状态: $service_status" >> "$LOG_FILE"
        
        # 尝试重启服务
        echo "$(date): 尝试重启 $SERVICE_NAME 服务..." >> "$LOG_FILE"
        systemctl restart "$SERVICE_NAME"
        sleep 5
        
        # 再次检查状态
        service_status=$(systemctl is-active "$SERVICE_NAME")
        if [ "$service_status" = "active" ]; then
            echo "$(date): $SERVICE_NAME 服务重启成功" >> "$LOG_FILE"
            send_alert "服务重启通知" "$SERVICE_NAME 服务已成功重启"
            return 0
        else
            echo "$(date): $SERVICE_NAME 服务重启失败" >> "$LOG_FILE"
            send_alert "服务故障警报" "$SERVICE_NAME 服务重启失败，需要人工干预"
            return 1
        fi
    fi
}

# 检查API响应
check_api() {
    local api_url="https://106.14.94.111/api/health"
    local timeout=10
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$api_url" --max-time "$timeout" 2>/dev/null)
    
    if [ "$http_code" = "200" ]; then
        echo "$(date): API健康检查通过 (HTTP $http_code)" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): API健康检查失败 (HTTP $http_code)" >> "$LOG_FILE"
        send_alert "API故障警报" "API健康检查失败，HTTP状态码: $http_code"
        return 1
    fi
}

# 检查Nginx状态
check_nginx() {
    local nginx_status=$(systemctl is-active nginx)
    
    if [ "$nginx_status" = "active" ]; then
        echo "$(date): Nginx 服务运行正常" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): Nginx 服务异常，状态: $nginx_status" >> "$LOG_FILE"
        
        # 尝试重启Nginx
        systemctl restart nginx
        sleep 3
        
        nginx_status=$(systemctl is-active nginx)
        if [ "$nginx_status" = "active" ]; then
            echo "$(date): Nginx 服务重启成功" >> "$LOG_FILE"
            send_alert "Nginx重启通知" "Nginx服务已成功重启"
            return 0
        else
            echo "$(date): Nginx 服务重启失败" >> "$LOG_FILE"
            send_alert "Nginx故障警报" "Nginx服务重启失败，需要人工干预"
            return 1
        fi
    fi
}

# 检查磁盘空间
check_disk_space() {
    local threshold=80
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -gt "$threshold" ]; then
        echo "$(date): 磁盘空间不足，使用率: ${usage}%" >> "$LOG_FILE"
        
        # 清理日志文件
        find /var/log/heat_exchanger -name "*.log" -mtime +7 -delete
        find /var/backups/heat_exchanger -name "*.gz" -mtime +7 -delete
        
        # 再次检查
        usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        echo "$(date): 清理后磁盘使用率: ${usage}%" >> "$LOG_FILE"
        
        if [ "$usage" -gt "$threshold" ]; then
            send_alert "磁盘空间警报" "磁盘使用率仍然过高: ${usage}%"
        fi
        
        return 1
    else
        echo "$(date): 磁盘空间正常，使用率: ${usage}%" >> "$LOG_FILE"
        return 0
    fi
}

# 检查内存使用
check_memory() {
    local threshold=90
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$memory_usage" -gt "$threshold" ]; then
        echo "$(date): 内存使用率过高: ${memory_usage}%" >> "$LOG_FILE"
        
        # 重启服务释放内存
        systemctl restart "$SERVICE_NAME"
        sleep 5
        
        memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        echo "$(date): 重启后内存使用率: ${memory_usage}%" >> "$LOG_FILE"
        
        if [ "$memory_usage" -gt "$threshold" ]; then
            send_alert "内存使用警报" "内存使用率仍然过高: ${memory_usage}%"
        fi
        
        return 1
    else
        echo "$(date): 内存使用正常，使用率: ${memory_usage}%" >> "$LOG_FILE"
        return 0
    fi
}

# 检查SSL证书
check_ssl_certificate() {
    local cert_file="/etc/letsencrypt/live/106.14.94.111/cert.pem"
    
    if [ -f "$cert_file" ]; then
        local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s)
        local current_timestamp=$(date +%s)
        local days_left=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ "$days_left" -lt 7 ]; then
            echo "$(date): SSL证书即将过期，剩余天数: $days_left" >> "$LOG_FILE"
            send_alert "SSL证书过期警报" "SSL证书将在 $days_left 天后过期"
            return 1
        elif [ "$days_left" -lt 30 ]; then
            echo "$(date): SSL证书警告，剩余天数: $days_left" >> "$LOG_FILE"
            return 0
        else
            echo "$(date): SSL证书正常，剩余天数: $days_left" >> "$LOG_FILE"
            return 0
        fi
    else
        echo "$(date): SSL证书文件不存在" >> "$LOG_FILE"
        send_alert "SSL证书警报" "SSL证书文件不存在"
        return 1
    fi
}

# 检查数据库完整性
check_database() {
    local db_path="/var/lib/heat_exchanger/requests.db"
    
    if [ -f "$db_path" ]; then
        local integrity_check=$(sqlite3 "$db_path" "PRAGMA integrity_check;" 2>/dev/null)
        
        if echo "$integrity_check" | grep -q "ok"; then
            echo "$(date): 数据库完整性检查通过" >> "$LOG_FILE"
            return 0
        else
            echo "$(date): 数据库完整性检查失败: $integrity_check" >> "$LOG_FILE"
            send_alert "数据库故障警报" "数据库完整性检查失败"
            return 1
        fi
    else
        echo "$(date): 数据库文件不存在" >> "$LOG_FILE"
        return 1
    fi
}

# 检查系统负载
check_system_load() {
    local load_1min=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_count=$(nproc)
    local threshold=$(echo "$cpu_count * 2.0" | bc -l 2>/dev/null || echo "4.0")
    
    if command -v bc >/dev/null 2>&1; then
        local comparison=$(echo "$load_1min > $threshold" | bc -l 2>/dev/null)
        if [ "$comparison" = "1" ]; then
            echo "$(date): 系统负载过高: $load_1min (阈值: $threshold)" >> "$LOG_FILE"
            send_alert "系统负载警报" "系统负载过高: $load_1min"
            return 1
        else
            echo "$(date): 系统负载正常: $load_1min" >> "$LOG_FILE"
            return 0
        fi
    else
        echo "$(date): 无法检查系统负载，bc命令不可用" >> "$LOG_FILE"
        return 0
    fi
}

# 生成监控报告
generate_report() {
    local report_file="/var/log/heat_exchanger/daily_report_$(date +%Y%m%d).txt"
    
    {
        echo "=========================================="
        echo "每日监控报告 - $(date)"
        echo "=========================================="
        echo ""
        echo "服务状态:"
        systemctl is-active "$SERVICE_NAME" nginx
        echo ""
        echo "系统资源:"
        echo "内存使用:"
        free -h
        echo ""
        echo "磁盘使用:"
        df -h
        echo ""
        echo "系统负载:"
        uptime
        echo ""
        echo "最近的错误日志:"
        tail -20 /var/log/heat_exchanger/monitor.log | grep -E "(ERROR|FAILED|异常|故障)" || echo "没有错误日志"
        echo ""
        echo "=========================================="
    } > "$report_file"
    
    echo "$(date): 每日报告已生成: $report_file" >> "$LOG_FILE"
}

# 主函数
main() {
    case "${1:-all}" in
        "all")
            echo "$(date): 开始完整监控检查..." >> "$LOG_FILE"
            check_service
            check_api
            check_nginx
            check_disk_space
            check_memory
            check_ssl_certificate
            check_database
            check_system_load
            echo "$(date): 完整监控检查完成" >> "$LOG_FILE"
            ;;
        "service")
            check_service
            ;;
        "api")
            check_api
            ;;
        "nginx")
            check_nginx
            ;;
        "disk")
            check_disk_space
            ;;
        "memory")
            check_memory
            ;;
        "ssl")
            check_ssl_certificate
            ;;
        "database")
            check_database
            ;;
        "load")
            check_system_load
            ;;
        "report")
            generate_report
            ;;
        "help"|"-h"|"--help")
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  all      完整监控检查 (默认)"
            echo "  service  检查服务状态"
            echo "  api      检查API响应"
            echo "  nginx    检查Nginx状态"
            echo "  disk     检查磁盘空间"
            echo "  memory   检查内存使用"
            echo "  ssl      检查SSL证书"
            echo "  database 检查数据库完整性"
            echo "  load     检查系统负载"
            echo "  report   生成监控报告"
            echo "  help     显示此帮助信息"
            ;;
        *)
            echo "未知选项: $1"
            echo "使用 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
