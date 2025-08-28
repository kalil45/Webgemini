import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from './apiConfig';

function ReportContent() {
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const transactionsTableRef = useRef(null);
  const expensesTableRef = useRef(null);

  const fetchReportData = useCallback(async () => {
    const { start, end } = dateRange;
    const transactionUrl = `${API_BASE_URL}/api/transactions?startDate=${start}&endDate=${end}`;
    const expenseUrl = `${API_BASE_URL}/api/expenses?startDate=${start}&endDate=${end}`;

    try {
      const [transactionResponse, expenseResponse] = await Promise.all([
        fetch(transactionUrl),
        fetch(expenseUrl),
      ]);

      if (!transactionResponse.ok || !expenseResponse.ok) {
        console.error('Failed to fetch report data');
        return;
      }

      const transactionsData = await transactionResponse.json();
      const expensesData = await expenseResponse.json();

      setTransactions(transactionsData);
      setExpenses(expensesData);
      calculateSummary(transactionsData, expensesData);

    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  }, [dateRange]);

  useEffect(() => {
    // Fetch initial data for all time when component mounts
    fetchReportData();
  }, [fetchReportData]);

  const calculateSummary = (transactionsData, expensesData) => {
    const totalSales = transactionsData.reduce((acc, t) => acc + parseFloat(t.total || 0), 0);
    const grossProfit = transactionsData.reduce((acc, t) => acc + (parseFloat(t.profitperunit || 0) * parseFloat(t.quantity || 0)), 0);
    const totalExpenses = expensesData.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
    const netProfit = grossProfit - totalExpenses;

    setSummary({ totalSales, grossProfit, totalExpenses, netProfit });
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handlePrint = (tableRef, title) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>' + title + '</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>' + title + '</h1>');
    printWindow.document.write(tableRef.current.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      {/* Filter Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">Filter Laporan</div>
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-auto">
              <label htmlFor="start" className="col-form-label">Tanggal Mulai</label>
            </div>
            <div className="col-auto">
              <input type="date" id="start" name="start" className="form-control" value={dateRange.start} onChange={handleDateChange} />
            </div>
            <div className="col-auto">
              <label htmlFor="end" className="col-form-label">Tanggal Akhir</label>
            </div>
            <div className="col-auto">
              <input type="date" id="end" name="end" className="form-control" value={dateRange.end} onChange={handleDateChange} />
            </div>
            <div className="col-auto">
              <button className="btn btn-primary" onClick={fetchReportData}>Tampilkan Laporan</button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">Ringkasan Laporan</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body">
                  <h5 className="card-title">Total Penjualan</h5>
                  <p className="card-text fs-4">{(summary.totalSales || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body">
                  <h5 className="card-title">Laba Kotor</h5>
                  <p className="card-text fs-4">{(summary.grossProfit || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-dark h-100">
                <div className="card-body">
                  <h5 className="card-title">Total Pengeluaran</h5>
                  <p className="card-text fs-4">{(summary.totalExpenses || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body">
                  <h5 className="card-title">Laba Bersih</h5>
                  <p className="card-text fs-4">{(summary.netProfit || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          Detail Transaksi Penjualan
          <button className="btn btn-sm btn-outline-secondary" onClick={() => handlePrint(transactionsTableRef, 'Laporan Transaksi Penjualan')}>🖨️ Cetak</button>
        </div>
        <div className="card-body">
          <div className="table-responsive" ref={transactionsTableRef}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Nama Produk</th>
                  <th>Jumlah</th>
                  <th>Harga Jual</th>
                  <th>Total</th>
                  <th>Laba</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map(t => (
                    <tr key={t.id}>
                      <td>{t.productname}</td>
                      <td>{t.quantity}</td>
                      <td>{formatCurrency(parseFloat(t.sellingprice) || 0)}</td>
                      <td>{formatCurrency(parseFloat(t.total) || 0)}</td>
                      <td>{formatCurrency((parseFloat(t.profitperunit) || 0) * (parseFloat(t.quantity) || 0))}</td>
                      <td>{formatDate(t.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center">Tidak ada transaksi pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expense Details */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          Detail Pengeluaran
          <button className="btn btn-sm btn-outline-secondary" onClick={() => handlePrint(expensesTableRef, 'Laporan Pengeluaran')}>🖨️ Cetak</button>
        </div>
        <div className="card-body">
          <div className="table-responsive" ref={expensesTableRef}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Deskripsi</th>
                  <th>Jumlah</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map(e => (
                    <tr key={e.id}>
                      <td>{e.description}</td>
                      <td>{formatCurrency(parseFloat(e.amount) || 0)}</td>
                      <td>{formatDate(e.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="text-center">Tidak ada pengeluaran pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ReportContent;
