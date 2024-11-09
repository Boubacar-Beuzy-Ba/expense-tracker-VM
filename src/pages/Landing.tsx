import React from 'react';
import { Button, Typography, Space, Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarOutlined,
  PieChartOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="fixed w-full top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Title level={4} style={{ margin: 0 }}>Expense Tracker</Title>
            </div>
            <Space>
              <Link to="/login">
                <Button type="link">Login</Button>
              </Link>
              <Link to="/signup">
                <Button type="primary">Sign Up</Button>
              </Link>
            </Space>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="pt-32 pb-20 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <Title>
            Smart Expense Management for Your Business
          </Title>
          <Paragraph className="text-lg text-gray-600 mt-6 mb-8 max-w-2xl mx-auto">
            Track expenses, manage budgets, and gain valuable insights with our comprehensive expense tracking solution.
          </Paragraph>
          <Space size="large">
            <Link to="/signup">
              <Button type="primary" size="large">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="large">
                Learn More
              </Button>
            </Link>
          </Space>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <DollarOutlined className="text-4xl text-blue-500 mb-4" />
                  <Title level={4}>Expense Tracking</Title>
                  <Paragraph>
                    Easily track and categorize all your business expenses in one place.
                  </Paragraph>
                </motion.div>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <PieChartOutlined className="text-4xl text-green-500 mb-4" />
                  <Title level={4}>Budget Management</Title>
                  <Paragraph>
                    Set and monitor budgets with real-time tracking and alerts.
                  </Paragraph>
                </motion.div>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TeamOutlined className="text-4xl text-purple-500 mb-4" />
                  <Title level={4}>Team Collaboration</Title>
                  <Paragraph>
                    Work together with your team to manage expenses efficiently.
                  </Paragraph>
                </motion.div>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card className="h-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <SafetyCertificateOutlined className="text-4xl text-red-500 mb-4" />
                  <Title level={4}>Secure & Reliable</Title>
                  <Paragraph>
                    Enterprise-grade security to protect your financial data.
                  </Paragraph>
                </motion.div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Title level={5}>Expense Tracker</Title>
            <Paragraph className="text-gray-500">
              © {new Date().getFullYear()} All rights reserved.
            </Paragraph>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;