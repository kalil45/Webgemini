import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './apiConfig';
import EditTransactionModal from './EditTransactionModal';
import Receipt from './Receipt'; // 1. Import Receipt component

function TransactionHistory({ showToast }) {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // 2. Add state for printing
  const [transactionToPrint, setTransactionToPrint] = useState(null);
  
  const transactionsPerPage = 5;
  const tableRef = useRef(null);
  const receiptRef = useRef(null); // Ref for the receipt component

  // 3. useEffect to trigger print
  useEffect(() => {
    if (transactionToPrint) {
      const timer = setTimeout(() => {
        window.print();
        setTransactionToPrint(null); // Reset after printing
      }, 100); // Delay to allow component to render
      return () => clearTimeout(timer);
    }
  }, [transactionToPrint]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        showToast('Gagal mengambil riwayat transaksi.', 'error');
      }
    } catch (error) {
      showToast(`Error mengambil riwayat transaksi: ${error.message}`, 'error');
    }
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

  const handleDelete = async (transactionId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini? Stok produk akan dikembalikan.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showToast('Transaksi berhasil dihapus.', 'success');
          fetchTransactions(); // Refresh the transaction list
        } else {
          const errorData = await response.json();
          showToast(`Gagal menghapus transaksi: ${errorData.error}`, 'error');
        }
      } catch (error) {
        showToast(`Terjadi kesalahan jaringan: ${error.message}`, 'error');
      }
    }
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  const handleSaveEdit = () => {
    fetchTransactions();
    handleCloseEditModal();
  };

  // 4. Function to handle individual receipt printing
  const handlePrintReceipt = (transaction) => {
    // The Receipt component expects specific prop names. Let's map them.
    const receiptData = {
      transaction: {
        ...transaction,
        productName: transaction.productname,
        sellingPrice: transaction.sellingprice,
        costPrice: transaction.costprice,
        profitPerUnit: transaction.profitperunit,
      },
      uangCash: transaction.total, // Placeholder, assuming exact payment
      uangKembali: 0,
    };
    setTransactionToPrint(receiptData);
  };

  const handlePrintTable = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Cetak Riwayat Transaksi</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Riwayat Transaksi</h1>');
    printWindow.document.write(tableRef.current.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = (transaction.productname || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? transaction.date === filterDate : true;
    return matchesSearch && matchesDate;
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 5. Placeholder for business details
  const businessDetails = {
    name: "Toko Anda",
    address: "Jalan Contoh No. 123",
    phone: "081234567890",
  };

  return (
    <>
      <h1>TEST</h1>
      {/* 6. Hidden div for printing individual receipts */}
      <div className="receipt-container">
        {transactionToPrint && (
          <Receipt
            ref={receiptRef}
            transactionData={transactionToPrint}
            businessDetails={businessDetails}
          />
        )}
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          Riwayat Transaksi
          <button className="btn btn-sm btn-outline-secondary" onClick={handlePrintTable}>🖨️ Cetak Tabel</button>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive" ref={tableRef}>
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Nama Produk</th>
                  <th>Jumlah</th>
                  <th>Harga Modal</th>
                  <th>Harga Jual</th>
                  <th>Laba/Unit</th>
                  <th>Total</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.productname}</td>
                      <td>{transaction.quantity}</td>
                      <td>{formatCurrency(transaction.costprice !== null && transaction.costprice !== undefined ? parseFloat(transaction.costprice) : 0)}</td>
                      <td>{formatCurrency(transaction.sellingprice || 0)}</td>
                      <td>{formatCurrency(transaction.profitperunit || 0)}</td>
                      <td>{formatCurrency(transaction.total || 0)}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        {/* 7. Add the new Print button */}
                        <button className="btn btn-sm btn-success me-2" onClick={() => handlePrintReceipt(transaction)}>Print</button>
                        <button className="btn btn-sm btn-info me-2" onClick={() => handleOpenEditModal(transaction)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(transaction.id)}>Hapus</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">Tidak ada transaksi ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showEditModal && (
        <EditTransactionModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
          transaction={editingTransaction}
          showToast={showToast}
        />
      )}
    </>
  );
}

export default TransactionHistory;
