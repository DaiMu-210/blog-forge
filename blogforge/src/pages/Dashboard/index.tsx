import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button, Space } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { articleApi } from '../../services/api';
import type { Article } from '../../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await articleApi.list({ page_size: 100 });
      setArticles(response.articles);

      const published = response.articles.filter(a => a.status === 'published').length;
      const draft = response.articles.filter(a => a.status === 'draft').length;

      setStats({
        total: response.total,
        published,
        draft,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const recentArticles = articles.slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">欢迎使用 BlogForge</h1>
        <p className="text-gray-500">您的桌面端博客管理助手</p>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="文章总数"
              value={stats.total}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="已发布"
              value={stats.published}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="草稿"
              value={stats.draft}
              prefix={<EditOutlined className="text-orange-500" />}
              loading={loading}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="回收站"
              value={0}
              prefix={<DeleteOutlined className="text-red-500" />}
              loading={loading}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card
            title="最近文章"
            bordered={false}
            extra={
              <Button type="link" onClick={() => navigate('/articles')}>
                查看全部
              </Button>
            }
          >
            <List
              loading={loading}
              dataSource={recentArticles}
              renderItem={(article) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/editor/${article.id}`)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{article.title}</span>
                        {article.status === 'published' ? (
                          <Tag color="green">已发布</Tag>
                        ) : (
                          <Tag color="orange">草稿</Tag>
                        )}
                      </Space>
                    }
                    description={`创建于 ${formatDate(article.created_at)}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="快捷操作" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={() => navigate('/editor/new')}
              >
                新建文章
              </Button>
              <Button block onClick={() => navigate('/articles')}>
                文章管理
              </Button>
              <Button block onClick={() => navigate('/images')}>
                图片管理
              </Button>
              <Button block onClick={() => navigate('/deploy')}>
                发布站点
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
