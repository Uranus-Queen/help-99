
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="/var/backups/heat_exchanger"
DB_PATH="/var/lib/heat_exchanger/requests.db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

# 创建备份函数
create_backup() {
    if [ -f "$DB_PATH" ]; then
        echo "开始备份数据库..."
        
        # 使用SQLite的.backup命令创建一致性备份
        sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/requests_$DATE.db"
        
        if [ $? -eq 0 ]; then
            # 压缩备份文件
            gzip "$BACKUP_DIR/requests_$DATE.db"
            
            echo "数据库备份完成: requests_$DATE.db.gz"
            
            # 记录备份日志
            echo "$(date): 数据库备份成功 - requests_$DATE.db.gz" >> /var/log/heat_exchanger/backup.log
            
            return 0
        else
            echo "数据库备份失败"
            echo "$(date): 数据库备份失败" >> /var/log/heat_exchanger/backup.log
            return 1
        fi
    else
        echo "数据库文件不存在: $DB_PATH"
        echo "$(date): 数据库文件不存在 - $DB_PATH" >> /var/log/heat_exchanger/backup.log
        return 1
    fi
}

# 清理旧备份函数
cleanup_old_backups() {
    echo "清理 $RETENTION_DAYS 天前的备份..."
    
    # 删除旧的数据库备份
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "requests_*.db.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
    
    if [ $DELETED_COUNT -gt 0 ]; then
        echo "已删除 $DELETED_COUNT 个旧备份文件"
        echo "$(date): 清理了 $DELETED_COUNT 个旧备份文件" >> /var/log/heat_exchanger/backup.log
    else
        echo "没有需要清理的旧备份"
    fi
}

# 验证备份函数
verify_backup() {
    BACKUP_FILE="$BACKUP_DIR/requests_$DATE.db.gz"
    
    if [ -f "$BACKUP_FILE" ]; then
        # 解压并验证数据库完整性
        TEMP_DB="/tmp/verify_backup_$DATE.db"
        gunzip -c "$BACKUP_FILE" > "$TEMP_DB"
        
        if sqlite3 "$TEMP_DB" "PRAGMA integrity_check;" | grep -q "ok"; then
            echo "备份验证成功"
            echo "$(date): 备份验证成功 - requests_$DATE.db.gz" >> /var/log/heat_exchanger/backup.log
            rm -f "$TEMP_DB"
            return 0
        else
            echo "备份验证失败"
            echo "$(date): 备份验证失败 - requests_$DATE.db.gz" >> /var/log/heat_exchanger/backup.log
            rm -f "$TEMP_DB"
            return 1
        fi
    else
        echo "备份文件不存在，无法验证"
        return 1
    fi
}

# 备份配置文件函数
backup_config() {
    echo "备份配置文件..."
    
    CONFIG_BACKUP_DIR="$BACKUP_DIR/config_$DATE"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    # 备份重要配置文件
    cp /var/www/heat-exchanger/.env "$CONFIG_BACKUP_DIR/" 2>/dev/null || true
    cp /etc/nginx/sites-available/heat-exchanger "$CONFIG_BACKUP_DIR/" 2>/dev/null || true
    cp /etc/systemd/system/heat-exchanger.service "$CONFIG_BACKUP_DIR/" 2>/dev/null || true
    
    # 创建配置备份压缩包
    tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" -C "$BACKUP_DIR" "config_$DATE"
    rm -rf "$CONFIG_BACKUP_DIR"
    
    echo "配置文件备份完成: config_$DATE.tar.gz"
}

# 显示备份信息函数
show_backup_info() {
    echo "=========================================="
    echo "备份信息"
    echo "=========================================="
    echo "备份目录: $BACKUP_DIR"
    echo "数据库路径: $DB_PATH"
    echo "保留天数: $RETENTION_DAYS"
    echo ""
    echo "最近的备份文件:"
    ls -la "$BACKUP_DIR"/requests_*.db.gz 2>/dev/null | tail -5 || echo "没有找到备份文件"
    echo ""
    echo "备份统计:"
    echo "数据库备份数量: $(find "$BACKUP_DIR" -name "requests_*.db.gz" | wc -l)"
    echo "配置备份数量: $(find "$BACKUP_DIR" -name "config_*.tar.gz" | wc -l)"
    echo "备份目录大小: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)"
    echo "=========================================="
}

# 主函数
main() {
    case "${1:-full}" in
        "full")
            echo "执行完整备份..."
            create_backup
            if [ $? -eq 0 ]; then
                verify_backup
                backup_config
                cleanup_old_backups
                show_backup_info
            fi
            ;;
        "db")
            echo "仅备份数据库..."
            create_backup
            verify_backup
            ;;
        "config")
            echo "仅备份配置..."
            backup_config
            ;;
        "cleanup")
            echo "仅清理旧备份..."
            cleanup_old_backups
            ;;
        "verify")
            echo "验证最新备份..."
            LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/requests_*.db.gz 2>/dev/null | head -1)
            if [ -n "$LATEST_BACKUP" ]; then
                DATE=$(basename "$LATEST_BACKUP" .db.gz | cut -d'_' -f2-)
                verify_backup
            else
                echo "没有找到备份文件"
            fi
            ;;
        "info")
            show_backup_info
            ;;
        "help"|"-h"|"--help")
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  full     完整备份 (默认)"
            echo "  db       仅备份数据库"
            echo "  config   仅备份配置文件"
            echo "  cleanup  仅清理旧备份"
            echo "  verify   验证最新备份"
            echo "  info     显示备份信息"
            echo "  help     显示此帮助信息"
            ;;
        *)
            echo "未知选项: $1"
            echo "使用 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
}

# 确保日志目录存在
mkdir -p /var/log/heat_exchanger

# 执行主函数
main "$@"
