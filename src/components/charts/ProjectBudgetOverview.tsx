import React from 'react';
import { Column } from '@ant-design/plots';
import { useCurrency } from '../../context/CurrencyContext';

type Project = {
  name: string;
  budget: number;
  spent: number;
};

type Props = {
  projects: Project[];
};

export function ProjectBudgetOverview({ projects }: Props) {
  const { currency } = useCurrency();

  const data = projects.flatMap(project => [
    {
      project: project.name,
      type: 'Budget',
      value: project.budget,
    },
    {
      project: project.name,
      type: 'Spent',
      value: project.spent,
    },
  ]);

  const config = {
    data,
    isGroup: true,
    xField: 'project',
    yField: 'value',
    seriesField: 'type',
    groupField: 'type',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'top',
      formatter: (datum: { value?: number }) => {
        return datum.value ? `${currency}${datum.value.toFixed(2)}` : `${currency}0.00`;
      },
    },
    tooltip: {
      formatter: (datum: { value?: number; type?: string }) => {
        return {
          name: datum.type || 'Unknown',
          value: datum.value ? `${currency}${datum.value.toFixed(2)}` : `${currency}0.00`,
        };
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Column {...config} />
    </div>
  );
}