"""
角色模型

定义系统中的角色和相关功能。
"""
from datetime import datetime
import uuid

# 角色定义
ROLES = {
    'admin': {
        'name': '管理员',
        'description': '系统管理员，拥有所有权限',
        'priority': 100
    },
    'manager': {
        'name': '经理',
        'description': '部门经理，拥有部门内的管理权限',
        'priority': 80
    },
    'user': {
        'name': '用户',
        'description': '普通用户，拥有基本功能权限',
        'priority': 50
    },
    'guest': {
        'name': '访客',
        'description': '访客用户，只有只读权限',
        'priority': 10
    }
}

# 角色权限定义在权限中间件中

class Role:
    """角色类
    
    用于表示系统中的角色和相关操作。
    """
    
    def __init__(self, role_id, code, name, description, priority, permissions=None, created_at=None, updated_at=None):
        """初始化角色

        Args:
            role_id: 角色ID
            code: 角色代码
            name: 角色名称
            description: 角色描述
            priority: 角色优先级
            permissions: 角色权限
            created_at: 创建时间
            updated_at: 更新时间
        """
        self.role_id = role_id or str(uuid.uuid4())
        self.code = code
        self.name = name
        self.description = description
        self.priority = priority
        self.permissions = permissions or {}
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    @classmethod
    def from_code(cls, code):
        """从角色代码创建角色

        Args:
            code: 角色代码

        Returns:
            Role: 角色对象
        """
        if code not in ROLES:
            return None
        
        role_data = ROLES[code]
        return cls(
            role_id=None,
            code=code,
            name=role_data['name'],
            description=role_data['description'],
            priority=role_data['priority']
        )
    
    def to_dict(self):
        """转换为字典

        Returns:
            dict: 角色字典
        """
        return {
            'role_id': self.role_id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'priority': self.priority,
            'permissions': self.permissions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @staticmethod
    def get_all_roles():
        """获取所有角色

        Returns:
            list: 所有角色列表
        """
        roles = []
        for code, role_data in ROLES.items():
            roles.append(Role(
                role_id=None,
                code=code,
                name=role_data['name'],
                description=role_data['description'],
                priority=role_data['priority']
            ))
        return roles
    
    @staticmethod
    def get_default_role():
        """获取默认角色

        Returns:
            Role: 默认角色
        """
        return Role.from_code('user')
    
    @staticmethod
    def is_valid_role(code):
        """检查角色是否有效

        Args:
            code: 角色代码

        Returns:
            bool: 是否有效
        """
        return code in ROLES 