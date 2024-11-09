import { Transaction } from '../lib/supabase';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useCurrency } from '../context/CurrencyContext';

export const exportToCSV = (transactions: Transaction[], currency: string) => {
  const csvContent = [
    ['Date', 'Description', `Amount (${currency})`, 'Category', 'Department'],
    ...transactions.map(t => [
      format(new Date(t.created_at), 'yyyy-MM-dd'),
      t.description,
      t.amount.toString(),
      t.category,
      t.department
    ])
  ]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};

export const generatePDF = (transactions: Transaction[], currency: string) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Transaction Report', 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on ${format(new Date(), 'PPP')}`, 14, 30);

  const tableColumn = ['Date', 'Description', `Amount (${currency})`, 'Category', 'Department'];
  const tableRows = transactions.map(t => [
    format(new Date(t.created_at), 'PPP'),
    t.description,
    `${currency}${Math.abs(t.amount).toFixed(2)}`,
    t.category,
    t.department
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [66, 139, 202]
    }
  });

  doc.save(`transactions_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};