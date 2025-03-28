import React, { useState } from 'react';
import { Card, Table, Space, Button, Input, Select, Typography, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, ExportOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

// 定义项目数据类型
interface ProjectData {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
}

// 模拟项目数据
const projectsData: ProjectData[] = [
  {
    id: '1',
    name: '亚马逊雨林保护计划',
    type: '雨林保护',
    location: '南美洲',
    status: '进行中',
    budget: 1250000,
    startDate: '2023-01-15',
    endDate: '2024-12-31',
    progress: 75,
  },
  {
    id: '2',
    name: '非洲大草原生态系统恢复',
    type: '生态恢复',
    location: '非洲',
    status: '规划中',
    budget: 845000,
    startDate: '2023-03-01',
    endDate: '2024-05-30',
    progress: 30,
  },
  {
    id: '3',
    name: '珊瑚礁修复与保护项目',
    type: '海洋保护',
    location: '大洋洲',
    status: '进行中',
    budget: 975000,
    startDate: '2022-11-10',
    endDate: '2025-11-09',
    progress: 60,
  },
  {
    id: '4',
    name: '北极冰川监测与研究',
    type: '气候监测',
    location: '北极圈',
    status: '进行中',
    budget: 1450000,
    startDate: '2023-06-01',
    endDate: '2026-05-31',
    progress: 45,
  },
  {
    id: '5',
    name: '湿地恢复与保护项目',
    type: '湿地保护',
    location: '欧洲',
    status: '已完成',
    budget: 580000,
    startDate: '2022-04-15',
    endDate: '2023-07-31',
    progress: 100,
  },
  {
    id: '6',
    name: '热带雨林生物多样性调研',
    type: '生物多样性',
    location: '东南亚',
    status: '进行中',
    budget: 920000,
    startDate: '2023-02-28',
    endDate: '2025-02-27',
    progress: 55,
  },
  {
    id: '7',
    name: '地中海沿岸生态系统保护',
    type: '海岸保护',
    location: '地中海',
    status: '暂停',
    budget: 750000,
    startDate: '2022-09-15',
    endDate: '2024-09-14',
    progress: 35,
  },
  {
    id: '8',
    name: '高山生态系统监测',
    type: '山地生态',
    location: '亚洲',
    status: '规划中',
    budget: 625000,
    startDate: '2023-08-01',
    endDate: '2025-07-31',
    progress: 15,
  }
];

const ProjectsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  
  // 状态颜色映射
  const statusColors: Record<string, string> = {
    '进行中': 'processing',
    '规划中': 'default',
    '已完成': 'success',
    '暂停': 'warning',
    '取消': 'error'
  };
  
  // 表格列定义
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
      sorter: (a: ProjectData, b: ProjectData) => a.name.localeCompare(b.name),
    },
    {
      title: '项目类型',
      dataIndex: 'type',
      key: 'type',
      filters: Array.from(new Set(projectsData.map(item => item.type))).map(type => ({
        text: type,
        value: type,
      })),
      onFilter: (value: any, record: ProjectData) => record.type === value,
    },
    {
      title: '地区',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={statusColors[status] as "success" | "processing" | "default" | "error" | "warning"} text={status} />
      ),
      filters: Array.from(new Set(projectsData.map(item => item.status))).map(status => ({
        text: status,
        value: status,
      })),
      onFilter: (value: any, record: ProjectData) => record.status === value,
    },
    {
      title: '预算 (USD)',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => `$${budget.toLocaleString()}`,
      sorter: (a: ProjectData, b: ProjectData) => a.budget - b.budget,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: (a: ProjectData, b: ProjectData) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: (a: ProjectData, b: ProjectData) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
      sorter: (a: ProjectData, b: ProjectData) => a.progress - b.progress,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, _record: ProjectData) => (
        <Space size="middle">
          <a>查看</a>
          <a>编辑</a>
        </Space>
      ),
    },
  ];
  
  // 搜索过滤
  const filteredData = projectsData.filter(item => {
    const matchesSearch = searchText === '' || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.type.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatusFilter = statusFilter.length === 0 || statusFilter.includes(item.status);
    const matchesTypeFilter = typeFilter.length === 0 || typeFilter.includes(item.type);
    
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });
  
  return (
    <div className="projects-page">
      <Title level={2}>生态项目管理</Title>
      
      {/* 顶部功能区 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space size="middle">
          <Input
            placeholder="搜索项目"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          
          <Select
            mode="multiple"
            placeholder="筛选项目状态"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Option value="进行中">进行中</Option>
            <Option value="规划中">规划中</Option>
            <Option value="已完成">已完成</Option>
            <Option value="暂停">暂停</Option>
            <Option value="取消">取消</Option>
          </Select>
          
          <Select
            mode="multiple"
            placeholder="筛选项目类型"
            style={{ width: 200 }}
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
          >
            {Array.from(new Set(projectsData.map(item => item.type))).map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Space>
        
        <Space>
          <Button icon={<PlusOutlined />} type="primary">
            新建项目
          </Button>
          <Button icon={<ExportOutlined />}>
            导出数据
          </Button>
        </Space>
      </div>
      
      {/* 项目表格 */}
      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          pagination={{ 
            pageSize: 5,
            showSizeChanger: true, 
            showQuickJumper: true,
            showTotal: total => `共 ${total} 个项目` 
          }}
        />
      </Card>
    </div>
  );
};

export default ProjectsPage;