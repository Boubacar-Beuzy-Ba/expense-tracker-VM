import React from 'react';
import { NavBar, List, Button, Form, Dialog, Input, Picker, DatePicker } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { ProjectBudgetAnalysis } from '../types/project';
import { useCurrency } from '../context/CurrencyContext';

type Props = {
  projects: ProjectBudgetAnalysis[];
  onCreateProject: (values: any) => void;
};

const departments = [
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Office', value: 'office' },
];

export function MobileProjects({ projects, onCreateProject }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [form] = Form.useForm();

  const showCreateDialog = async () => {
    const result = await Dialog.confirm({
      title: 'Create Project',
      content: (
        <Form
          form={form}
          layout="vertical"
          footer={null}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="budget"
            label="Budget"
            rules={[{ required: true }]}
          >
            <Input type="number" placeholder="Enter budget" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            trigger="onConfirm"
            rules={[{ required: true }]}
          >
            <Picker columns={[departments]}>
              {(value) => value ? value[0]?.label : 'Select department'}
            </Picker>
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Start Date"
            trigger="onConfirm"
            rules={[{ required: true }]}
          >
            <DatePicker>
              {(value) => value ? value.toLocaleDateString() : 'Select date'}
            </DatePicker>
          </Form.Item>
        </Form>
      ),
    });

    if (result) {
      const values = await form.validateFields();
      onCreateProject(values);
      form.resetFields();
    }
  };

  return (
    <div>
      <NavBar
        right={
          <Button
            onClick={showCreateDialog}
            icon={<AddOutline />}
          >
            New
          </Button>
        }
      >
        Projects
      </NavBar>

      <List>
        {projects.map((project) => (
          <List.Item
            key={project.project_id}
            onClick={() => navigate(`/project/${project.project_id}`)}
            description={
              <div className="space-y-1">
                <div>
                  Budget: {currency}{project.total_budget.toFixed(2)}
                </div>
                <div className={project.total_spent < 0 ? 'text-red-500' : 'text-green-500'}>
                  Spent: {currency}{Math.abs(project.total_spent).toFixed(2)}
                </div>
              </div>
            }
            extra={
              <span className={project.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}>
                {currency}{project.remaining_budget.toFixed(2)}
              </span>
            }
          >
            {project.project_name}
          </List.Item>
        ))}
      </List>
    </div>
  );
}