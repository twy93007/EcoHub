#!/usr/bin/env python3
"""
权限系统测试脚本

用于测试权限系统的各项功能，包括：
1. 获取角色列表
2. 获取角色详情
3. 获取角色权限
4. 获取当前用户权限
5. 使用不同角色测试资源访问权限
"""
import requests
import json
import sys
import time
from datetime import datetime

API_URL = "http://localhost:5000"

def pretty_print(data):
    """格式化打印JSON数据"""
    print(json.dumps(data, indent=2, ensure_ascii=False))

def login(username, password):
    """登录并获取令牌"""
    print(f"\n====== 使用 {username} 登录 ======")
    try:
        response = requests.post(
            f"{API_URL}/api/auth/login",
            json={"username": username, "password": password}
        )
        if response.status_code == 200:
            data = response.json()
            pretty_print(data)
            print(f"✅ 以 {username} 身份登录成功")
            return data["data"]["access_token"], data["data"]["user"]["role"]
        else:
            print(f"❌ 登录失败: {response.status_code}")
            pretty_print(response.json())
            return None, None
    except Exception as e:
        print(f"❌ 登录出错: {e}")
        return None, None

def test_get_roles(token):
    """测试获取角色列表"""
    print("\n====== 测试获取角色列表 ======")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/roles/", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 获取角色列表成功")
        else:
            print(f"❌ 获取角色列表失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取角色列表出错: {e}")

def test_get_role(token, role_code):
    """测试获取角色详情"""
    print(f"\n====== 测试获取角色 {role_code} 详情 ======")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/roles/{role_code}", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print(f"✅ 获取角色 {role_code} 详情成功")
        else:
            print(f"❌ 获取角色 {role_code} 详情失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取角色详情出错: {e}")

def test_get_role_permissions(token, role_code):
    """测试获取角色权限"""
    print(f"\n====== 测试获取角色 {role_code} 权限 ======")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/roles/{role_code}/permissions", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print(f"✅ 获取角色 {role_code} 权限成功")
        else:
            print(f"❌ 获取角色 {role_code} 权限失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取角色权限出错: {e}")

def test_get_my_permissions(token, role):
    """测试获取当前用户权限"""
    print(f"\n====== 测试获取当前用户({role})权限 ======")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/api/roles/me/permissions", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 获取当前用户权限成功")
        else:
            print(f"❌ 获取当前用户权限失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取当前用户权限出错: {e}")

def test_user_operations(token, role):
    """测试用户操作权限"""
    print(f"\n====== 测试用户操作权限({role}) ======")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 测试获取用户列表
    print("\n--- 测试获取用户列表 ---")
    try:
        response = requests.get(f"{API_URL}/api/users/", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 获取用户列表成功")
        else:
            print(f"❌ 获取用户列表失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取用户列表出错: {e}")
    
    # 测试创建用户
    print("\n--- 测试创建用户 ---")
    try:
        user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "password123",
            "role": "user"
        }
        response = requests.post(f"{API_URL}/api/users/", json=user_data, headers=headers)
        pretty_print(response.json())
        if response.status_code in [200, 201]:
            print("✅ 创建用户成功")
        else:
            print(f"❌ 创建用户失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 创建用户出错: {e}")
    
    # 测试更新用户
    print("\n--- 测试更新用户 ---")
    try:
        user_data = {
            "username": "updateduser",
            "email": "updated@example.com",
            "role": "user"
        }
        response = requests.put(f"{API_URL}/api/users/2", json=user_data, headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 更新用户成功")
        else:
            print(f"❌ 更新用户失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 更新用户出错: {e}")
    
    # 测试删除用户
    print("\n--- 测试删除用户 ---")
    try:
        response = requests.delete(f"{API_URL}/api/users/3", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 删除用户成功")
        else:
            print(f"❌ 删除用户失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 删除用户出错: {e}")

def main():
    """主函数"""
    print(f"开始测试权限系统 ({API_URL})")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 使用admin角色登录
    admin_token, admin_role = login("admin", "admin")
    if admin_token:
        test_get_roles(admin_token)
        test_get_role(admin_token, "admin")
        test_get_role(admin_token, "user")
        test_get_role_permissions(admin_token, "admin")
        test_get_my_permissions(admin_token, admin_role)
        test_user_operations(admin_token, admin_role)
    
    # 使用普通用户角色登录 (这里模拟，实际环境中应该有用户注册)
    print("\n\n==========================================")
    print("模拟使用普通用户角色进行测试")
    print("==========================================\n")
    
    # 这里假设有一个user角色的用户
    user_token, user_role = login("user", "user")
    if user_token:
        test_get_roles(user_token)
        test_get_role(user_token, "user")
        test_get_my_permissions(user_token, user_role)
        test_user_operations(user_token, user_role)
    
    print("\n测试完成!")

if __name__ == "__main__":
    main() 