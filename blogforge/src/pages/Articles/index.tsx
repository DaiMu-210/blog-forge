import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PushpinOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { articleApi } from '../../services/api';
import type { Article, ArticleQuery } from '../../types';

export const ArticleList: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    loadArticles();
  }, [pagination.current, statusFilter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const query: ArticleQuery = {
        page: pagination.current,
        page_size: pagination.pageSize,
        status: statusFilter,
      };
      const response = await articleApi.list(query);
      setArticles(response.articles);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error('加载文章列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadArticles();
      return;
    }
    try {
      setLoading(true);
      const results = await articleApi.search(searchKeyword);
      setArticles(results);
      setPagination(prev => ({ ...prev, total: results.length }));
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？删除后可以在回收站恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await articleApi.delete(id);
          message.success('删除成功');
          loadArticles();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handlePublish = async (id: number) => {
    try {
      await articleApi.publish(id);
      message.success('发布成功');
      loadArticles();
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await articleApi.unpublish(id);
      message.success('取消发布成功');
      loadArticles();
    } catch (error) {
      message.error('取消发布失败');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Article) => (
        <Space>
          <span>{title}</span>
          {record.is_top && (
            <Tooltip title="置顶">
              <PushpinOutlined className="text-orange-500" />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          published: { color: 'green', text: '已发布' },
          draft: { color: 'orange', text: '草稿' },
          trash: { color: 'red', text: '回收站' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Article) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/editor/${record.id}`)}
            />
          </Tooltip>
          {record.status === 'published' ? (
            <Tooltip title="取消发布">
              <Button
                type="text"
                size="small"
                icon={<EyeInvisibleOutlined />}
                onClick={() => handleUnpublish(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="发布">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePublish(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">文章管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/editor/new')}
        >
          新建文章
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <Space>
          <Input
            placeholder="搜索文章..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
          />
          <Button onClick={handleSearch}>搜索</Button>
        </Space>
        <Space>
          <Button
            type={statusFilter === undefined ? 'primary' : 'default'}
            onClick={() => setStatusFilter(undefined)}
          >
            全部
          </Button>
          <Button
            type={statusFilter === 'published' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('published')}
          >
            已发布
          </Button>
          <Button
            type={statusFilter === 'draft' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('draft')}
          >
            草稿
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize });
          },
        }}
      />
    </div>
  );
};
