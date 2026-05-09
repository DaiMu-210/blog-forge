import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Space,
  Input,
  message,
  Divider,
  Card,
  Form,
  Tag,
  Select,
  Modal,
  Timeline,
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  HistoryOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { articleApi, tagApi, categoryApi } from '../../services/api';
import type { Tag as TagType, Category, CreateTagDto, CreateCategoryDto } from '../../types';

const { TextArea } = Input;

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const articleId = isNew ? null : parseInt(id || '0');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [coverImage, setCoverImage] = useState('');
  const [isTop, setIsTop] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tags, setTags] = useState<TagType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [versions, setVersions] = useState<Array<{ id: number; title: string; created_at: string }>>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    loadMetadata();
    if (!isNew && articleId) {
      loadArticle(articleId);
    }
  }, [articleId, isNew]);

  const loadMetadata = async () => {
    try {
      const [tagsData, categoriesData] = await Promise.all([
        tagApi.list(),
        categoryApi.list(),
      ]);
      setTags(tagsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const loadArticle = async (id: number) => {
    try {
      const article = await articleApi.get(id);
      setTitle(article.title);
      setContent(article.content || '');
      setExcerpt(article.excerpt || '');
      setMetaTitle(article.meta_title || '');
      setMetaDescription(article.meta_description || '');
      setMetaKeywords(article.meta_keywords || '');
      setCoverImage(article.cover_image || '');
      setIsTop(article.is_top);
      setStatus(article.status as 'draft' | 'published');

      const versionsData = await articleApi.getVersions(id);
      setVersions(versionsData);
    } catch (error) {
      message.error('加载文章失败');
      navigate('/articles');
    }
  };

  const handleSave = async (publishStatus?: 'draft' | 'published') => {
    if (!title.trim()) {
      message.warning('请输入文章标题');
      return;
    }

    try {
      setSaving(true);
      const data = {
        title,
        content,
        excerpt,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        meta_keywords: metaKeywords || undefined,
        cover_image: coverImage || undefined,
        is_top: isTop,
        status: publishStatus || status,
      };

      if (isNew) {
        const result = await articleApi.create(data);
        message.success('保存成功');
        navigate(`/editor/${result.id}`);
      } else if (articleId) {
        await articleApi.update(articleId, data);
        message.success('保存成功');
        loadArticle(articleId);
      }
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const dto: CreateTagDto = { name: newTagName };
      const tag = await tagApi.create(dto);
      setTags([...tags, tag]);
      setNewTagName('');
      setShowTagModal(false);
      message.success('标签创建成功');
    } catch (error) {
      message.error('创建标签失败');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const dto: CreateCategoryDto = { name: newCategoryName };
      const category = await categoryApi.create(dto);
      setCategories([...categories, category]);
      setNewCategoryName('');
      setShowCategoryModal(false);
      message.success('分类创建成功');
    } catch (error) {
      message.error('创建分类失败');
    }
  };

  const handleRestoreVersion = async (versionId: number) => {
    if (!articleId) return;
    try {
      await articleApi.restoreVersion(articleId, versionId);
      message.success('版本恢复成功');
      loadArticle(articleId);
      setShowVersions(false);
    } catch (error) {
      message.error('版本恢复失败');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0]">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/articles')}>
            返回
          </Button>
          <span className="text-lg font-medium">文章编辑器</span>
        </Space>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => setShowVersions(true)}>
            历史版本
          </Button>
          <Button icon={<EyeOutlined />} onClick={() => message.info('预览功能开发中')}>
            预览
          </Button>
          <Button onClick={() => handleSave('draft')} loading={saving}>
            保存草稿
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => handleSave('published')} loading={saving}>
            发布
          </Button>
        </Space>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          <Input
            placeholder="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-semibold border-0 border-b border-[#F0F0F0] rounded-none mb-4 px-0"
            size="large"
          />
          <TextArea
            placeholder="开始写作..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] font-mono code-editor"
            autoSize={{ minRows: 20 }}
          />
        </div>

        <div className="w-80 border-l border-[#F0F0F0] p-4 overflow-auto bg-[#FAFAFA]">
          <Card size="small" title="文章设置" className="mb-4">
            <Form layout="vertical" size="small">
              <Form.Item label="状态">
                <Tag color={status === 'published' ? 'green' : 'orange'}>
                  {status === 'published' ? '已发布' : '草稿'}
                </Tag>
              </Form.Item>
              <Form.Item label="置顶">
                <Button
                  type={isTop ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setIsTop(!isTop)}
                >
                  {isTop ? '已置顶' : '取消置顶'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card size="small" title="分类和标签" className="mb-4">
            <Form layout="vertical" size="small">
              <Form.Item label="分类">
                <Select
                  placeholder="选择分类"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  allowClear
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setShowCategoryModal(true)}
                        className="w-full"
                      >
                        新建分类
                      </Button>
                    </>
                  )}
                />
              </Form.Item>
              <Form.Item label="标签">
                <Select
                  mode="multiple"
                  placeholder="选择标签"
                  value={selectedTags}
                  onChange={setSelectedTags}
                  allowClear
                  options={tags.map(t => ({ value: t.id, label: t.name }))}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setShowTagModal(true)}
                        className="w-full"
                      >
                        新建标签
                      </Button>
                    </>
                  )}
                />
              </Form.Item>
            </Form>
          </Card>

          <Card size="small" title="SEO 设置" className="mb-4">
            <Form layout="vertical" size="small">
              <Form.Item label="封面图片">
                <Input
                  placeholder="输入封面图片 URL"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="SEO 标题">
                <Input
                  placeholder="SEO 标题"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="SEO 描述">
                <TextArea
                  placeholder="SEO 描述"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                />
              </Form.Item>
              <Form.Item label="关键词">
                <Input
                  placeholder="关键词（逗号分隔）"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
              </Form.Item>
            </Form>
          </Card>

          <Card size="small" title="摘要">
            <TextArea
              placeholder="文章摘要"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={4}
            />
          </Card>
        </div>
      </div>

      <Modal
        title="历史版本"
        open={showVersions}
        onCancel={() => setShowVersions(false)}
        footer={null}
        width={600}
      >
        <Timeline
          items={versions.map(v => ({
            color: 'blue',
            children: (
              <div>
                <div className="font-medium">{v.title}</div>
                <div className="text-gray-500 text-sm">{formatDate(v.created_at)}</div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleRestoreVersion(v.id)}
                >
                  恢复此版本
                </Button>
              </div>
            ),
          }))}
        />
      </Modal>

      <Modal
        title="新建标签"
        open={showTagModal}
        onCancel={() => setShowTagModal(false)}
        onOk={handleCreateTag}
      >
        <Input
          placeholder="标签名称"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
        />
      </Modal>

      <Modal
        title="新建分类"
        open={showCategoryModal}
        onCancel={() => setShowCategoryModal(false)}
        onOk={handleCreateCategory}
      >
        <Input
          placeholder="分类名称"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </Modal>
    </div>
  );
};
