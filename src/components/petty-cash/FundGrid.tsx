import React from 'react';
import { Row, Col, Spin } from 'antd';
import { FundCard } from './FundCard';
import { FundSummary } from '../../types/petty-cash';
import { useMediaQuery } from 'react-responsive';

type Props = {
  funds: FundSummary[];
  isLoading?: boolean;
};

export function FundGrid({ funds, isLoading }: Props) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const getColSpan = () => {
    if (isMobile) return 24;
    if (isTablet) return 12;
    return 8;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {funds.map((fund) => (
        <Col key={fund.id} span={getColSpan()}>
          <FundCard fund={fund} />
        </Col>
      ))}
    </Row>
  );
}