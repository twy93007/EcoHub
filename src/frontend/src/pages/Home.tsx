import React from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Typography, Divider } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  RiseOutlined,
  FileProtectOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 模拟新闻数据
const newsList = [
  {
    id: 1,
    title: '第三季度全球生态保护项目报告发布',
    date: '2023-10-15',
    summary: '本季度新增200个生态保护项目，覆盖42个国家，项目成功率提升15%',
    avatar: <EnvironmentOutlined style={{ color: '#52c41a' }} />
  },
  {
    id: 2,
    title: '国际生态论坛即将在纽约召开',
    date: '2023-10-10',
    summary: '超过50个国家300位专家将参与此次论坛，共同探讨全球生态保护策略',
    avatar: <TeamOutlined style={{ color: '#1890ff' }} />
  },
  {
    id: 3,
    title: '新的生态评估方法论获得国际认可',
    date: '2023-10-05',
    summary: '由我们团队开发的新型生态系统评估方法被国际生态保护组织采纳',
    avatar: <FileProtectOutlined style={{ color: '#722ed1' }} />
  }
];

// 模拟项目数据
const projectsList = [
  {
    id: 1,
    title: '亚马逊雨林保护计划',
    status: '进行中',
    progress: 75,
    area: '南美洲',
    type: '雨林保护'
  },
  {
    id: 2,
    title: '非洲大草原生态系统恢复',
    status: '规划中',
    progress: 30,
    area: '非洲',
    type: '生态恢复'
  },
  {
    id: 3,
    title: '珊瑚礁修复与保护项目',
    status: '进行中',
    progress: 60,
    area: '大洋洲',
    type: '海洋保护'
  },
  {
    id: 4,
    title: '北极冰川监测与研究',
    status: '进行中',
    progress: 45,
    area: '北极圈',
    type: '气候监测'
  }
];

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <Title level={2}>生态系统管理平台</Title>
      <Paragraph>
        欢迎使用EcoHub系统，这里提供了全球生态保护项目的管理与数据分析工具。
      </Paragraph>
      
      <Divider />
      
      {/* 数据统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="活跃项目"
              value={208}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="注册用户"
              value={1503}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="覆盖国家"
              value={42}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="项目增长"
              value={15.3}
              precision={1}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 最新动态 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="最新动态" className="news-card">
            <List
              itemLayout="horizontal"
              dataSource={newsList}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.avatar} />}
                    title={item.title}
                    description={
                      <div>
                        <div>{item.date}</div>
                        <div>{item.summary}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        {/* 项目概览 */}
        <Col xs={24} md={12}>
          <Card title="项目概览" className="projects-card">
            <List
              itemLayout="horizontal"
              dataSource={projectsList}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <div>
                        <div>状态: {item.status} | 区域: {item.area}</div>
                        <div>类型: {item.type} | 进度: {item.progress}%</div>
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
  );
};

export default HomePage; 