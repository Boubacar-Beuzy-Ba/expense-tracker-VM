import React from 'react';
import { Progress } from 'antd';

interface ProjectBudgetCellProps {
  totalBudget: number;
  totalSpent: number;
  isOverBudget: boolean;
}

export function ProjectBudgetCell({ totalBudget, totalSpent, isOverBudget }: ProjectBudgetCellProps) {
  if (!totalBudget || !totalSpent) return null;
  
  const percentage = Math.abs((totalSpent / totalBudget) * 100);
  
  return (
    <Progress
      percent={Math.min(percentage, 100)}
      status={isOverBudget ? 'exception' : 'active'}
      size="small"
    />
  );
}