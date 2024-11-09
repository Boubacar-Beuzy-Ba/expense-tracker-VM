import React from 'react';
import * as XLSX from 'xlsx';
import { Transaction } from '../lib/supabase';
import { motion } from 'framer-motion';
import { FiDownload, FiUpload, FiPrinter } from 'react-icons/fi';
import { exportToCSV, generatePDF } from '../utils/export';
import { useCurrency } from '../context/CurrencyContext';
import { Button, Space, Tooltip, Upload } from 'antd';

type Props = {
  transactions: Transaction[];
  onImport: (transactions: Partial<Transaction>[]) => void;
};

export function ImportExport({ transactions, onImport }: Props) {
  const { currency } = useCurrency();

  const handleExport = () => {
    exportToCSV(transactions, currency);
  };

  const handlePrintPDF = () => {
    generatePDF(transactions, currency);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const wb = XLSX.read(event.target?.result, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as Partial<Transaction>[];
      onImport(data);
    };
    reader.readAsBinaryString(file);
    return false;
  };

  return (
    <Space>
      <Tooltip title="Export to CSV">
        <Button
          type="primary"
          icon={<FiDownload />}
          onClick={handleExport}
        />
      </Tooltip>

      <Tooltip title="Print PDF">
        <Button
          type="primary"
          icon={<FiPrinter />}
          onClick={handlePrintPDF}
        />
      </Tooltip>

      <Upload
        accept=".xlsx,.xls"
        showUploadList={false}
        beforeUpload={handleImport}
      >
        <Tooltip title="Import Excel">
          <Button
            type="primary"
            icon={<FiUpload />}
          />
        </Tooltip>
      </Upload>
    </Space>
  );
}