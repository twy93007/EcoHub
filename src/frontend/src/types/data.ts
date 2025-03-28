// 数据层级类型
export type DataLevel = 'raw' | 'processed' | 'derived';

// 数据来源类型
export type SourceType = 'manual' | 'api' | 'automated';

// 数据类型
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json';

// 数据列元数据
export interface ColumnMetadata {
  name: string;
  type: DataType;
  description?: string;
  is_required: boolean;
  is_unique: boolean;
  default_value?: any;
  validation_rules?: {
    type: string;
    params: any;
    message: string;
  }[];
}

// 数据表
export interface DataTable {
  id: string;
  dataset_id: string;
  name: string;
  description: string;
  column_count: number;
  row_count: number;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

// 数据集
export interface DataSet {
  id: string;
  name: string;
  description: string;
  data_level: 'raw' | 'processed' | 'derived';
  source_type: 'manual' | 'api' | 'automated';
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

// 数据预览配置
export interface PreviewConfig {
  page: number;
  page_size: number;
  sort_field?: string;
  sort_order?: 'ascend' | 'descend';
  filters?: {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
  }[];
}

// 数据预览结果
export interface PreviewResult {
  total: number;
  data: any[];
  columns: ColumnMetadata[];
}

// 数据导出配置
export interface ExportConfig {
  format: 'csv' | 'excel' | 'json';
  include_header: boolean;
  encoding: string;
  delimiter?: string;
  sheet_name?: string;
  columns?: string[];
  filters?: {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
  }[];
}

// 数据导入配置
export interface ImportConfig {
  format: 'csv' | 'excel' | 'json';
  encoding: string;
  delimiter?: string;
  sheet_name?: string;
  skip_rows?: number;
  column_mapping?: {
    [key: string]: string;
  };
  data_type_inference?: boolean;
  validation_rules?: {
    column: string;
    rules: {
      type: string;
      params: any;
      message: string;
    }[];
  }[];
}

// 数据表统计信息
export interface TableStats {
  row_count: number;
  column_count: number;
  storage_size: number;
  last_updated: string;
  data_types: {
    [key: string]: {
      type: DataType;
      count: number;
      null_count: number;
      unique_count: number;
    };
  };
}

// 数据集统计信息
export interface DatasetStats {
  table_count: number;
  total_rows: number;
  storage_size: number;
  last_updated: string;
  data_levels: {
    [key in DataLevel]: number;
  };
  source_types: {
    [key in SourceType]: number;
  };
  tags: {
    [key: string]: number;
  };
}

export interface DataColumn {
  id: string;
  table_id: string;
  name: string;
  type: string;
  description: string;
  is_nullable: boolean;
  default_value?: any;
}

export interface DataValidationRule {
  id: string;
  table_id: string;
  column_id?: string;
  rule_type: string;
  parameters: Record<string, any>;
  error_message: string;
}

export interface DataTransform {
  id: string;
  table_id: string;
  transform_type: string;
  parameters: Record<string, any>;
  source_columns: string[];
  target_columns: string[];
}

export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    type: 'validation' | 'transform';
    config: DataValidationRule | DataTransform;
  }>;
  schedule?: {
    type: 'manual' | 'interval' | 'cron';
    interval?: number;
    cron?: string;
  };
} 