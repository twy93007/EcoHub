#!/bin/bash

# 等待 PostgreSQL 就绪
until PGPASSWORD=postgres psql -h db -U postgres -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - executing command"

# 创建数据库
PGPASSWORD=postgres psql -h db -U postgres -c "CREATE DATABASE ecohub;"

# 创建表和初始数据
PGPASSWORD=postgres psql -h db -U postgres -d ecohub -c "
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建默认角色
INSERT INTO roles (role_name, description) VALUES
    ('admin', '系统管理员'),
    ('user', '普通用户')
ON CONFLICT (role_name) DO NOTHING;

-- 创建默认管理员用户 (密码: admin)
INSERT INTO users (username, password_hash, email, role) VALUES
    ('admin', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDAX5ZxZz3q6', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;
"

echo "Database initialization completed!" 