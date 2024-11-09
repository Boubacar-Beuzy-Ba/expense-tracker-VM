import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Space, Modal, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import en from '../../i18n/locales/en.json';
import fr from '../../i18n/locales/fr.json';

const { TextArea } = Input;

type TranslationKey = {
  key: string;
  en: string;
  fr: string;
};

export function TranslationManager() {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<TranslationKey | null>(null);
  const [searchText, setSearchText] = useState('');
  const [translations, setTranslations] = useState<TranslationKey[]>([]);
  const [form] = Form.useForm();

  // Flatten nested object into dot notation
  const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  useEffect(() => {
    const flatEn = flattenObject(en);
    const flatFr = flattenObject(fr);
    
    const allKeys = new Set([...Object.keys(flatEn), ...Object.keys(flatFr)]);
    
    const translationsList = Array.from(allKeys).map(key => ({
      key,
      en: flatEn[key] || '',
      fr: flatFr[key] || ''
    }));

    setTranslations(translationsList);
  }, []);

  // Filter translations based on search text
  const filteredTranslations = translations.filter(translation => {
    const searchLower = searchText.toLowerCase();
    return (
      translation.key.toLowerCase().includes(searchLower) ||
      translation.en.toLowerCase().includes(searchLower) ||
      translation.fr.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: t('settings.translations.key'),
      dataIndex: 'key',
      key: 'key',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'English',
      dataIndex: 'en',
      key: 'en',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Français',
      dataIndex: 'fr',
      key: 'fr',
      width: '30%',
      ellipsis: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: '10%',
      render: (_: any, record: TranslationKey) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingKey(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      // Update translations in memory
      const updatedTranslations = translations.map(t => 
        t.key === values.key ? values : t
      );
      setTranslations(updatedTranslations);
      
      message.success(t('settings.translations.saveSuccess'));
      setIsModalVisible(false);
      form.resetFields();
      setEditingKey(null);
    } catch (error) {
      message.error(t('settings.translations.saveError'));
    }
  };

  const handleDelete = async (key: string) => {
    try {
      // Remove translation from memory
      setTranslations(translations.filter(t => t.key !== key));
      message.success(t('settings.translations.deleteSuccess'));
    } catch (error) {
      message.error(t('settings.translations.deleteError'));
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder={t('settings.translations.search')}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingKey(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          {t('settings.translations.add')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTranslations}
        rowKey="key"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => t('common.pagination', {
            start: range[0],
            end: range[1],
            total
          }),
        }}
      />

      <Modal
        title={editingKey ? t('settings.translations.edit') : t('settings.translations.add')}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingKey(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="key"
            label={t('settings.translations.key')}
            rules={[{ required: true, message: t('settings.translations.keyRequired') }]}
          >
            <Input disabled={!!editingKey} />
          </Form.Item>

          <Form.Item
            name="en"
            label="English"
            rules={[{ required: true, message: t('settings.translations.valueRequired') }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="fr"
            label="Français"
            rules={[{ required: true, message: t('settings.translations.valueRequired') }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingKey(null);
              }}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}