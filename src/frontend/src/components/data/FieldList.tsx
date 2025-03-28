import React from 'react';
import { Table, Tag, Space, Tooltip } from 'antd';
import { KeyOutlined, LinkOutlined } from '@ant-design/icons';

interface Field {
  id: string;
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

interface FieldListProps {
  fields: Field[];
  onFieldSelect?: (selectedFields: Field[]) => void;
}

const FieldList: React.FC<FieldListProps> = ({ fields, onFieldSelect }) => {
  const columns = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Field) => (
        <Space>
          {text}
          {record.isPrimaryKey && (
            <Tooltip title="主键">
              <KeyOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
          {record.isForeignKey && (
            <Tooltip title="外键">
              <LinkOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '约束',
      key: 'constraints',
      render: (text: string, record: Field) => (
        <Space>
          {record.isRequired && <Tag color="red">必填</Tag>}
          {record.isPrimaryKey && <Tag color="blue">主键</Tag>}
          {record.isForeignKey && <Tag color="green">外键</Tag>}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={fields}
      rowKey="id"
      rowSelection={onFieldSelect ? {
        type: 'checkbox',
        onChange: (selectedRowKeys, selectedRows) => {
          onFieldSelect(selectedRows);
        },
      } : undefined}
      size="small"
      pagination={false}
    />
  );
};

export default FieldList; 