# API设计文档更新

## API设计原则

1. **RESTful API设计**
   - 使用HTTP方法表示操作（GET, POST, PUT, DELETE）
   - 使用HTTP状态码表示结果
   - 资源路径使用名词而非动词
   - 支持过滤、排序、分页和字段选择

2. **GraphQL API设计**
   - 用于复杂数据查询和聚合
   - 允许客户端指定所需字段
   - 减少网络请求和数据传输

3. **API安全**
   - 使用OAuth 2.0 + JWT进行认证
   - 实现RBAC权限控制
   - 实施API限流和防滥用措施
   - 所有API通过HTTPS传输

4. **API版本控制**
   - 在URL路径中包含版本号（如/api/v1/）
   - 支持API版本共存
   - 明确废弃策略和过渡期

5. **统一响应格式**
   - 成功响应格式一致
   - 错误响应包含详细信息
   - 使用标准HTTP状态码

## API网关

API网关作为所有外部请求的统一入口，提供以下功能：

1. **请求路由**：将请求路由到相应的微服务
2. **认证授权**：统一处理用户认证和权限验证
3. **请求限流**：防止恶意请求和服务过载
4. **请求日志**：记录所有API调用
5. **响应缓存**：缓存常用数据减少服务负载
6. **请求转换**：支持协议转换和数据格式转换

## 核心API端点

### 1. 用户服务 API

#### 用户注册
- **URL**: `/api/v1/users/register`
- **方法**: `POST`
- **请求体**: 
```json
{
  "username": "用户名",
  "email": "电子邮箱",
  "password": "密码",
  "profile": {
    "real_name": "真实姓名",
    "organization": "组织机构"
  }
}
```
- **响应**:
```json
{
  "status": "success",
  "data": {
    "user_id": "用户ID",
    "username": "用户名",
    "email": "电子邮箱",
    "created_at": "创建时间"
  }
}
```

#### 用户登录
- **URL**: `/api/v1/auth/login`
- **方法**: `POST`
- **请求体**:
```json
{
  "email": "电子邮箱",
  "password": "密码",
  "remember_me": true
}
```
- **响应**:
```json
{
  "status": "success",
  "data": {
    "access_token": "JWT访问令牌",
    "refresh_token": "刷新令牌",
    "expires_in": 3600,
    "user": {
      "id": "用户ID",
      "username": "用户名",
      "role": "用户角色"
    }
  }
}
```

#### 获取用户信息
- **URL**: `/api/v1/users/me`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
```json
{
  "status": "success",
  "data": {
    "id": "用户ID",
    "username": "用户名",
    "email": "电子邮箱",
    "profile": {
      "real_name": "真实姓名",
      "organization": "组织机构",
      "bio": "个人简介"
    },
    "metrics": {
      "contribution_score": 75,
      "activity_level": "活跃"
    },
    "created_at": "创建时间",
    "last_login_at": "最后登录时间"
  }
}
```

### 2. 数据管理服务 API

#### 创建数据集
- **URL**: `/api/v1/datasets`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "name": "数据集名称",
  "description": "数据集描述",
  "visibility": "public/private/restricted",
  "tags": ["标签1", "标签2"],
  "metadata": {
    "source": "数据来源",
    "update_frequency": "更新频率"
  }
}
```
- **响应**:
```json
{
  "status": "success",
  "data": {
    "dataset_id": "数据集ID",
    "name": "数据集名称",
    "creator": {
      "id": "创建者ID",
      "username": "创建者用户名"
    },
    "created_at": "创建时间"
  }
}
```

#### 上传数据表
- **URL**: `/api/v1/datasets/{dataset_id}/tables`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **内容类型**: `multipart/form-data`
- **请求参数**:
  - `file`: 数据文件
  - `name`: 数据表名称
  - `description`: 数据表描述
  - `metadata`: 元数据JSON字符串
- **响应**:
```json
{
  "status": "success",
  "data": {
    "table_id": "数据表ID",
    "name": "数据表名称",
    "preview": {
      "columns": ["列1", "列2", "列3"],
      "sample_data": [
        ["值1", "值2", "值3"],
        ["值1", "值2", "值3"]
      ],
      "row_count": 1000,
      "column_count": 10
    },
    "created_at": "创建时间"
  }
}
```

### 3. 数据匹配服务 API

#### 创建匹配任务
- **URL**: `/api/v1/matching/tasks`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "name": "匹配任务名称",
  "description": "匹配任务描述",
  "source_tables": ["源数据表ID1", "源数据表ID2"],
  "target_tables": ["目标数据表ID1"],
  "matching_rules": [
    {
      "source_field": "源字段",
      "target_field": "目标字段",
      "match_type": "exact/fuzzy/semantic",
      "similarity_threshold": 0.8,
      "weight": 1.0
    }
  ],
  "execution_config": {
    "algorithm": "匹配算法",
    "parameters": {
      "param1": "值1",
      "param2": "值2"
    }
  }
}
```
- **响应**:
```json
{
  "status": "success",
  "data": {
    "task_id": "匹配任务ID",
    "name": "匹配任务名称",
    "status": "pending",
    "created_at": "创建时间"
  }
}
```

#### 获取匹配结果
- **URL**: `/api/v1/matching/tasks/{task_id}/results`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**: `page=1&limit=20&min_confidence=0.7`
- **响应**:
```json
{
  "status": "success",
  "data": {
    "task_id": "匹配任务ID",
    "status": "completed",
    "statistics": {
      "total_matches": 1500,
      "high_confidence_matches": 1200,
      "low_confidence_matches": 300,
      "execution_time": "10s"
    },
    "matches": [
      {
        "source_id": "源数据项ID",
        "target_id": "目标数据项ID",
        "confidence": 0.95,
        "match_details": {
          "field_matches": [
            {
              "source_field": "源字段",
              "target_field": "目标字段",
              "similarity": 0.98
            }
          ]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1500,
      "pages": 75
    }
  }
}
```

### 4. 数据分析服务 API

#### 创建分析任务
- **URL**: `/api/v1/analysis/tasks`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "name": "分析任务名称",
  "description": "分析任务描述",
  "type": "statistical/prediction/timeseries",
  "input_data": {
    "tables": ["数据表ID1", "数据表ID2"],
    "parameters": {
      "target_field": "目标字段",
      "features": ["特征1", "特征2"]
    },
    "filters": {
      "field1": {"operator": ">=", "value": 100},
      "field2": {"operator": "in", "value": ["A", "B", "C"]}
    }
  },
  "analysis_config": {
    "method": "分析方法",
    "parameters": {
      "param1": "值1",
      "param2": "值2"
    }
  }
}
```
- **响应**:
```json
{
  "status": "success",
  "data": {
    "task_id": "分析任务ID",
    "name": "分析任务名称",
    "status": "pending",
    "created_at": "创建时间"
  }
}
```

### 5. 数据可视化服务 API

#### 创建可视化
- **URL**: `/api/v1/visualizations`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "name": "可视化名称",
  "description": "可视化描述",
  "type": "可视化类型",
  "data_source": {
    "table_id": "数据表ID",
    "query": "数据查询",
    "filters": {
      "field1": {"operator": ">=", "value": 100}
    }
  },
  "config": {
    "chart_type": "图表类型",
    "dimensions": ["维度字段1", "维度字段2"],
    "measures": ["度量字段1", "度量字段2"],
    "style": {
      "color_palette": "颜色配置",
      "font_size": "字体大小"
    }
  }
}
```
- **响应**:
```json
{
  "status": "success",
  "data": {
    "visualization_id": "可视化ID",
    "name": "可视化名称",
    "type": "可视化类型",
    "thumbnail_url": "缩略图URL",
    "created_at": "创建时间"
  }
}
```

### 6. 数据集市服务 API

#### 发布数据产品
- **URL**: `/api/v1/market/products`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
```json
{
  "dataset_id": "数据集ID",
  "name": "产品名称",
  "description": "产品描述",
  "category": "产品分类",
  "pricing": {
    "type": "free/one_time/subscription",
    "price": 99.99,
    "currency": "CNY",
    "discount": {
      "percentage": 20,
      "valid_until": "2023-12-31"
    }
  },
  "license_terms": "许可条款",
  "preview_config": {
    "enable_preview": true,
    "preview_rows": 50
  }
}
```
- **响应**:
```json
{
  "status": "success",
  "data": {
    "product_id": "产品ID",
    "name": "产品名称",
    "seller": {
      "id": "销售者ID",
      "username": "销售者用户名"
    },
    "status": "draft",
    "created_at": "创建时间"
  }
}
```

### 7. AI辅助服务 API

#### 获取数据推荐
- **URL**: `/api/v1/ai/recommendations/datasets`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**: `limit=10&context=research`
- **响应**:
```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "dataset_id": "数据集ID",
        "name": "数据集名称",
        "description": "数据集描述",
        "confidence": 0.92,
        "reason": "推荐理由"
      }
    ],
    "context": {
      "user_interests": ["经济数据", "金融分析"],
      "recent_activities": ["查看了相关数据集"]
    }
  }
}
```

## GraphQL API

对于复杂的数据查询和聚合，我们提供GraphQL API端点：

- **URL**: `/api/v1/graphql`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体示例**:
```json
{
  "query": "query GetUserDashboard($userId: ID!) { user(id: $userId) { id username datasets { id name last_updated } visualizations { id name type } recent_activities { action timestamp resource_type } } }",
  "variables": {
    "userId": "用户ID"
  }
}
```

## 错误处理

所有API遵循统一的错误响应格式：

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "用户友好的错误消息",
    "details": "错误详情（可选）",
    "path": "出错的请求路径",
    "timestamp": "错误发生时间"
  }
}
```

常见错误码：
- `UNAUTHORIZED` - 未授权访问
- `FORBIDDEN` - 无权限执行操作
- `NOT_FOUND` - 资源不存在
- `VALIDATION_ERROR` - 输入验证失败
- `RATE_LIMIT_EXCEEDED` - 超出请求限制
- `INTERNAL_SERVER_ERROR` - 服务器内部错误