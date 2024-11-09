import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ProjectTable } from '../components/ProjectTable';
import { Project } from '../types/project';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

export default function Projects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [form] = Form.useForm();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['project_budget_analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_budget_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createProject = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: values.name,
          description: values.description,
          budget: values.budget,
          department: values.department,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date?.toISOString(),
          user_id: user?.id,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_budget_analysis'] });
      toast.success(t('projects.addSuccess'));
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      console.error('Project creation error:', error);
      toast.error(t('projects.addError'));
    },
  });

  const updateProject = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: values.name,
          description: values.description,
          budget: values.budget,
          department: values.department,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date?.toISOString(),
          status: values.status
        })
        .eq('id', editingProject?.project_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_budget_analysis'] });
      toast.success(t('projects.updateSuccess'));
      setIsModalVisible(false);
      setEditingProject(null);
      form.resetFields();
    },
    onError: (error) => {
      console.error('Project update error:', error);
      toast.error(t('projects.updateError'));
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_budget_analysis'] });
      toast.success(t('projects.deleteSuccess'));
    },
    onError: (error) => {
      console.error('Project deletion error:', error);
      toast.error(t('projects.deleteError'));
    },
  });

  const handleCreateOrUpdateProject = async (values: any) => {
    if (editingProject) {
      await updateProject.mutate(values);
    } else {
      await createProject.mutate(values);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.project_name,
      description: project.description,
      budget: project.total_budget,
      department: project.department,
      status: project.status,
      start_date: project.start_date ? dayjs(project.start_date) : undefined,
      end_date: project.end_date ? dayjs(project.end_date) : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProject.mutate(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <Card
        title={t('projects.title')}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingProject(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            {t('projects.new')}
          </Button>
        }
      >
        <ProjectTable 
          projects={projects || []} 
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        title={editingProject ? t('projects.edit') : t('projects.new')}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProject(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdateProject}
        >
          <Form.Item
            name="name"
            label={t('projects.name')}
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('projects.description')}
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea placeholder={t('projects.descriptionPlaceholder')} />
          </Form.Item>

          <Form.Item
            name="budget"
            label={t('projects.budget')}
            rules={[{ required: true, message: 'Please enter budget' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              placeholder="Enter budget"
            />
          </Form.Item>

          <Form.Item
            name="department"
            label={t('transactions.department')}
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Select department">
              <Select.Option value="warehouse">{t('transactions.departments.warehouse')}</Select.Option>
              <Select.Option value="office">{t('transactions.departments.office')}</Select.Option>
            </Select>
          </Form.Item>

          {editingProject && (
            <Form.Item
              name="status"
              label={t('projects.status')}
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Select.Option value="active">{t('projects.statuses.active')}</Select.Option>
                <Select.Option value="completed">{t('projects.statuses.completed')}</Select.Option>
                <Select.Option value="cancelled">{t('projects.statuses.cancelled')}</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="End Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={createProject.isPending || updateProject.isPending}
            >
              {editingProject ? t('common.save') : t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}