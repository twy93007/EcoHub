import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  List, 
  Tag, 
  Divider, 
  Spin, 
  Empty 
} from 'antd';
import { 
  DatabaseOutlined, 
  LinkOutlined, 
  AreaChartOutlined, 
  ShopOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { get } from '../services/api';

const { Title, Paragraph } = Typography;

// 模拟数据活动记录
const recentActivities = [
  { id: 1, title: '上传了数据表', time: '1小时前', type: 'upload', user: '张三' },
  { id: 2, title: '创建了匹配任务', time: '3小时前', type: 'match', user: '李四' },
  { id: 3, title: '分享了数据分析报告', time: '5小时前', type: 'analysis', user: '王五' },
  { id: 4, title: '发布了数据产品', time: '1天前', type: 'marketplace', user: '赵六' },
  { id: 5, title: '更新了数据模板', time: '2天前', type: 'template', user: '钱七' }
];

// 模拟热门数据表
const popularDatasets = [
  { id: 1, title: '中国城市GDP数据(2010-2023)', views: 1254, downloads: 536, type: '经济数据' },
  { id: 2, title: '全球气候变化指标', views: 982, downloads: 321, type: '环境数据' },
  { id: 3, title: '上市公司财务报表汇总', views: 875, downloads: 298, type: '金融数据' },
  { id: 4, title: '人口普查数据分析', views: 654, downloads: 187, type: '人口数据' },
  { id: 5, title: '消费者行为调研', views: 542, downloads: 145, type: '市场数据' }
];

// 获取活动类型对应的标签颜色
const getTagColor = (type: string) => {
  const colorMap: Record<string, string> = {
    upload: 'blue',
    match: 'green',
    analysis: 'purple',
    marketplace: 'orange',
    template: 'cyan'
  };
  return colorMap[type] || 'default';
};

const Dashboard: React.FC = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    dataTables: 0,
    dataSets: 0,
    matchingTasks: 0,
    analysisReports: 0,
    marketplaceItems: 0,
    users: 0
  });
  
  // 加载统计数据
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        // TODO: 实际项目中应该从API获取数据
        // const response = await get('/api/dashboard/statistics');
        // if (response.status === 'success') {
        //   setStatistics(response.data);
        // }
        
        // 目前使用模拟数据
        setTimeout(() => {
          setStatistics({
            dataTables: 156,
            dataSets: 42,
            matchingTasks: 28,
            analysisReports: 35,
            marketplaceItems: 67,
            users: 128
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('获取仪表盘统计数据失败:', error);
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  
  return (
    <Spin spinning={loading}>
      <div className="dashboard-page">
        <Title level={2}>仪表盘</Title>
        <Paragraph>
          欢迎回来, {user?.username || '用户'}！以下是EcoHub平台的关键指标和最新动态。
        </Paragraph>
        
        <Divider />
        
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="数据表总数"
                value={statistics.dataTables}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="匹配任务"
                value={statistics.matchingTasks}
                prefix={<LinkOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="分析报告"
                value={statistics.analysisReports}
                prefix={<AreaChartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="数据集总数"
                value={statistics.dataSets}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="市场数据产品"
                value={statistics.marketplaceItems}
                prefix={<ShopOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic 
                title="平台用户数"
                value={statistics.users}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>
        
        {/* 活动和数据区域 */}
        <Row gutter={[16, 16]}>
          {/* 最近活动 */}
          <Col xs={24} md={12}>
            <Card title="平台动态" className="activity-card">
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          {item.title}
                          <Tag color={getTagColor(item.type)} style={{ marginLeft: 8 }}>
                            {item.type}
                          </Tag>
                        </span>
                      }
                      description={`${item.user} · ${item.time}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          {/* 热门数据表 */}
          <Col xs={24} md={12}>
            <Card title="热门数据" className="datasets-card">
              <List
                itemLayout="horizontal"
                dataSource={popularDatasets}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={
                        <div>
                          <Tag color="blue">{item.type}</Tag>
                          <span style={{ marginLeft: 8 }}>
                            浏览: {item.views} | 下载: {item.downloads}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard; 