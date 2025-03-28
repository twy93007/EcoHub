#!/usr/bin/env python3
"""
API网关测试脚本

用于测试API网关的各项功能，包括：
1. 健康检查
2. 身份验证（登录、注册、刷新令牌）
3. 用户数据访问
4. 密码重置功能
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

def test_health():
    """测试健康检查端点"""
    print("\n====== 测试健康检查 ======")
    try:
        response = requests.get(f"{API_URL}/health")
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 健康检查成功")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 健康检查出错: {e}")

def test_auth():
    """测试身份验证功能"""
    print("\n====== 测试身份验证 ======")
    
    # 测试登录
    print("\n--- 测试登录 ---")
    try:
        response = requests.post(
            f"{API_URL}/api/auth/login",
            json={"username": "admin", "password": "admin"}
        )
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 登录成功")
            auth_data = response.json()["data"]
            access_token = auth_data["access_token"]
            refresh_token = auth_data["refresh_token"]
            return access_token, refresh_token
        else:
            print(f"❌ 登录失败: {response.status_code}")
            return None, None
    except Exception as e:
        print(f"❌ 登录出错: {e}")
        return None, None

def test_token_refresh(refresh_token):
    """测试刷新令牌功能"""
    print("\n--- 测试刷新令牌 ---")
    try:
        response = requests.post(
            f"{API_URL}/api/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 刷新令牌成功")
            return response.json()["data"]["access_token"]
        else:
            print(f"❌ 刷新令牌失败: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ 刷新令牌出错: {e}")
        return None

def test_get_user_info(access_token):
    """测试获取用户信息"""
    print("\n====== 测试获取用户信息 ======")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{API_URL}/api/users/me", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 获取用户信息成功")
        else:
            print(f"❌ 获取用户信息失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取用户信息出错: {e}")

def test_logout(access_token):
    """测试注销功能"""
    print("\n====== 测试注销 ======")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.post(f"{API_URL}/api/auth/logout", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 注销成功")
        else:
            print(f"❌ 注销失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 注销出错: {e}")

def test_password_reset():
    """测试密码重置功能"""
    print("\n====== 测试密码重置 ======")
    
    # 测试忘记密码
    print("\n--- 测试忘记密码 ---")
    email = "test@example.com"
    try:
        response = requests.post(
            f"{API_URL}/api/auth/password/forgot",
            json={"email": email}
        )
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 发送重置码成功")
            reset_code = response.json()["data"]["reset_code"]
            
            # 测试验证重置码
            print("\n--- 测试验证重置码 ---")
            verify_response = requests.post(
                f"{API_URL}/api/auth/password/verify",
                json={"email": email, "reset_code": reset_code}
            )
            pretty_print(verify_response.json())
            if verify_response.status_code == 200:
                print("✅ 验证重置码成功")
                temp_token = verify_response.json()["data"]["temp_token"]
                
                # 测试重置密码
                print("\n--- 测试重置密码 ---")
                reset_response = requests.post(
                    f"{API_URL}/api/auth/password/reset",
                    json={
                        "email": email,
                        "new_password": "newpassword123",
                        "temp_token": temp_token
                    }
                )
                pretty_print(reset_response.json())
                if reset_response.status_code == 200:
                    print("✅ 重置密码成功")
                else:
                    print(f"❌ 重置密码失败: {reset_response.status_code}")
            else:
                print(f"❌ 验证重置码失败: {verify_response.status_code}")
        else:
            print(f"❌ 发送重置码失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 密码重置测试出错: {e}")

def test_change_password(access_token):
    """测试修改密码功能"""
    print("\n====== 测试修改密码 ======")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.post(
            f"{API_URL}/api/auth/password/change",
            json={"old_password": "admin", "new_password": "newadminpass"},
            headers=headers
        )
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 修改密码成功")
        else:
            print(f"❌ 修改密码失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 修改密码出错: {e}")

def test_permissions(access_token):
    """测试权限系统"""
    print("\n====== 测试权限系统 ======")
    
    # 测试获取角色列表
    print("\n--- 测试获取角色列表 ---")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{API_URL}/api/roles/", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 获取角色列表成功")
        else:
            print(f"❌ 获取角色列表失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取角色列表出错: {e}")
    
    # 测试获取当前用户权限
    print("\n--- 测试获取当前用户权限 ---")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{API_URL}/api/roles/me/permissions", headers=headers)
        pretty_print(response.json())
        if response.status_code == 200:
            print("✅ 获取当前用户权限成功")
        else:
            print(f"❌ 获取当前用户权限失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取当前用户权限出错: {e}")

def main():
    """主函数"""
    print(f"开始测试API网关 ({API_URL})")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 测试健康检查
    test_health()
    
    # 测试身份验证
    access_token, refresh_token = test_auth()
    if access_token and refresh_token:
        # 测试获取用户信息
        test_get_user_info(access_token)
        
        # 测试权限系统
        test_permissions(access_token)
        
        # 测试刷新令牌
        new_access_token = test_token_refresh(refresh_token)
        if new_access_token:
            # 使用新的访问令牌测试
            test_get_user_info(new_access_token)
            
            # 测试修改密码
            test_change_password(new_access_token)
            
            # 测试注销
            test_logout(new_access_token)
    
    # 测试密码重置
    test_password_reset()
    
    print("\n测试完成!")

if __name__ == "__main__":
    main() 