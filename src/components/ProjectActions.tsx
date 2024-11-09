import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface ProjectActionsProps {
  projectId: string;
  onDelete: (id: string) => void;
}

export function ProjectActions({ projectId, onDelete }: ProjectActionsProps) {
  const navigate = useNavigate();

  return (
    <Space size="middle">
      <Tooltip title="View details" key={`view-${projectId}`}>
        <Button
          type="text"
          icon={<FiEye />}
          onClick={() => navigate(`/project/${projectId}`)}
          className="flex items-center justify-center"
        />
      </Tooltip>
      <Tooltip title="Delete project" key={`delete-${projectId}`}>
        <Button
          type="text"
          danger
          icon={<FiTrash2 />}
          onClick={() => onDelete(projectId)}
          className="flex items-center justify-center"
        />
      </Tooltip>
    </Space>
  );
}