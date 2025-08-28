import React, { useState, useEffect, useCallback } from 'react';
import SummaryCards from './SummaryCards';
import SalesChart from './SalesChart';

import TransactionHistory from './TransactionHistory';
import ToastNotification from './ToastNotification';
import Sidebar from './Sidebar';
import ReportContent from './ReportContent';
import ProductContent from './ProductContent';
import ExpenseContent from './ExpenseContent';
import CapitalContent from './CapitalContent';
import AddTransactionContent from './AddTransactionContent';
import { saveAs } from 'file-saver';
import './App.css'; // Import App.css
import { API_BASE_URL } from './apiConfig';

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('appTheme');
    return savedTheme || 'light';
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard'); // New state for active menu
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh components

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prevState) => !prevState);
  };

  const toggleMobileSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const showToast = (message, type) => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast({
      ...toast,
      show: false,
    });
  };

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
  };

  const refreshDashboardData = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleExportReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const transactions = await response.json();
        if (transactions.length === 0) {
          showToast('Tidak ada data transaksi untuk diekspor.', 'info');
          return;
        }

        const headers = ['ID', 'Nama Produk', 'Jumlah', 'Harga Modal', 'Harga Jual', 'Laba/Unit', 'Total', 'Tanggal'];
        const csvRows = [];
        csvRows.push(headers.join(','));

        transactions.forEach(transaction => {
          const row = [
            transaction.id,
            `"${transaction.productName}"`, // Note: This is a template literal with escaped double quotes, which is valid.
            transaction.quantity,
            transaction.costPrice,
            transaction.sellingPrice,
            transaction.profitPerUnit,
            transaction.total,
            transaction.date,
          ];
          csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'laporan_transaksi.csv');
        showToast('Laporan berhasil diekspor! ✅', 'success');

      } else {
        showToast('Gagal mengambil data transaksi untuk ekspor. ⚠️', 'error');
      }
    } catch (error) {
      showToast(`Terjadi kesalahan saat ekspor laporan: ${error.message} ⚠️`, 'error');
    }
  };

  return (
    <div className="d-flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen} // Pass state to Sidebar
        toggleMobileSidebar={toggleMobileSidebar} // Pass function to Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        activeMenu={activeMenu}
        handleMenuClick={handleMenuClick}
      />
      <div className={`flex-grow-1 p-3 ${isSidebarCollapsed ? 'ms-70px' : 'ms-280px'}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-primary d-md-none" onClick={toggleMobileSidebar}>
            ☰
          </button>
          <h1>{activeMenu}</h1>
          <div className="d-none d-md-flex">
            <button className="btn btn-success me-2" onClick={() => handleMenuClick('Produk')}>Tambah Produk</button>
            <button className="btn btn-primary me-2" onClick={() => handleMenuClick('Tambah Transaksi')}>Tambah Transaksi</button>
            <button className="btn btn-warning me-2" onClick={() => handleMenuClick('Pengeluaran')}>Catat Pengeluaran</button>
            <button className="btn btn-info" onClick={handleExportReport}>Export Laporan</button>
          </div>
        </div>
        {activeMenu === 'Dashboard' && (
          <>
            <SummaryCards key={`summary-${refreshKey}`} showToast={showToast} />
            <SalesChart key={`sales-${refreshKey}`} />
            
            <TransactionHistory showToast={showToast} />
          </>
        )}
        {activeMenu === 'Laporan' && <ReportContent key={`report-${refreshKey}`} />}
        {activeMenu === 'Produk' && <ProductContent showToast={showToast} />}
        {activeMenu === 'Tambah Transaksi' && <AddTransactionContent showToast={showToast} onTransactionAdded={refreshDashboardData} />}
        {activeMenu === 'Pengeluaran' && <ExpenseContent showToast={showToast} refreshDashboardData={refreshDashboardData} />}
        {activeMenu === 'Modal' && <CapitalContent refreshDashboardData={refreshDashboardData} />}
      </div>
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
