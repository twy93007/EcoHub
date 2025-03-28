// EcoHub MongoDB初始化脚本
db = db.getSiblingDB('ecohub');

// 创建集合
db.createCollection('raw_datasets');
db.createCollection('data_entities');
db.createCollection('matching_results');
db.createCollection('analysis_results');
db.createCollection('ai_models');
db.createCollection('data_schemas');
db.createCollection('audit_logs');
db.createCollection('system_config');
db.createCollection('data_transformations');
db.createCollection('user_preferences');

// 为raw_datasets集合创建索引
db.raw_datasets.createIndex({ "dataset_id": 1 }, { unique: true });
db.raw_datasets.createIndex({ "name": 1 });
db.raw_datasets.createIndex({ "owner_id": 1 });
db.raw_datasets.createIndex({ "created_at": 1 });
db.raw_datasets.createIndex({ "tags": 1 });

// 为data_entities集合创建索引
db.data_entities.createIndex({ "entity_id": 1 }, { unique: true });
db.data_entities.createIndex({ "dataset_id": 1 });
db.data_entities.createIndex({ "entity_type": 1 });

// 为matching_results集合创建索引
db.matching_results.createIndex({ "task_id": 1 });
db.matching_results.createIndex({ "source_id": 1 });
db.matching_results.createIndex({ "target_id": 1 });
db.matching_results.createIndex({ "confidence_score": 1 });
db.matching_results.createIndex({ 
    "task_id": 1, 
    "source_id": 1, 
    "target_id": 1 
}, { unique: true });

// 为analysis_results集合创建索引
db.analysis_results.createIndex({ "task_id": 1 }, { unique: true });
db.analysis_results.createIndex({ "dataset_id": 1 });
db.analysis_results.createIndex({ "analysis_type": 1 });
db.analysis_results.createIndex({ "created_at": 1 });

// 为ai_models集合创建索引
db.ai_models.createIndex({ "model_id": 1 }, { unique: true });
db.ai_models.createIndex({ "model_type": 1 });
db.ai_models.createIndex({ "created_at": 1 });

// 为data_schemas集合创建索引
db.data_schemas.createIndex({ "schema_id": 1 }, { unique: true });
db.data_schemas.createIndex({ "dataset_id": 1 });

// 为audit_logs集合创建索引
db.audit_logs.createIndex({ "timestamp": 1 });
db.audit_logs.createIndex({ "user_id": 1 });
db.audit_logs.createIndex({ "action": 1 });

// 为user_preferences集合创建索引
db.user_preferences.createIndex({ "user_id": 1 }, { unique: true });

// 创建系统配置文档
db.system_config.insertOne({
    "config_id": "system_default",
    "version": "1.0.0",
    "max_upload_size_mb": 100,
    "supported_file_formats": ["csv", "json", "excel", "parquet"],
    "default_matching_algorithm": "fuzzy_matching",
    "default_analysis_methods": ["descriptive", "correlation", "timeseries"],
    "maintenance_mode": false,
    "created_at": new Date(),
    "updated_at": new Date()
});

// 创建数据匹配算法配置
db.system_config.insertOne({
    "config_id": "matching_algorithms",
    "algorithms": [
        {
            "name": "exact_matching",
            "display_name": "精确匹配",
            "description": "基于精确字段匹配的算法",
            "parameters": {
                "case_sensitive": false,
                "match_fields": []
            }
        },
        {
            "name": "fuzzy_matching",
            "display_name": "模糊匹配",
            "description": "基于模糊字符串比较的算法",
            "parameters": {
                "threshold": 0.8,
                "match_fields": [],
                "algorithm": "levenshtein"
            }
        },
        {
            "name": "ml_matching",
            "display_name": "机器学习匹配",
            "description": "使用机器学习模型进行实体匹配",
            "parameters": {
                "model_type": "default",
                "confidence_threshold": 0.75,
                "features": []
            }
        }
    ],
    "created_at": new Date(),
    "updated_at": new Date()
});

// 创建数据分析方法配置
db.system_config.insertOne({
    "config_id": "analysis_methods",
    "methods": [
        {
            "name": "descriptive",
            "display_name": "描述性统计",
            "description": "提供数据集的基本统计信息",
            "supported_data_types": ["numeric", "categorical", "temporal"]
        },
        {
            "name": "correlation",
            "display_name": "相关性分析",
            "description": "分析变量之间的相关性",
            "supported_data_types": ["numeric"]
        },
        {
            "name": "timeseries",
            "display_name": "时间序列分析",
            "description": "分析时间序列数据的趋势和模式",
            "supported_data_types": ["temporal", "numeric"]
        },
        {
            "name": "clustering",
            "display_name": "聚类分析",
            "description": "对数据进行聚类分析",
            "supported_data_types": ["numeric"]
        }
    ],
    "created_at": new Date(),
    "updated_at": new Date()
});