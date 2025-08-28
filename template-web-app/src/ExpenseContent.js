import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './apiConfig';
import AddExpenseForm from './AddExpenseForm';
import EditExpenseModal from './EditExpenseModal'; // Import the modal

function ExpenseContent({ showToast, refreshDashboardData }) {
  const [expenses, setExpenses] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        showToast('Gagal mengambil data pengeluaran.', 'error');
      }
    } catch (error) {
      showToast(`Error mengambil data pengeluaran: ${error.message}`, 'error');
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

  const handleDelete = async (expenseId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini? Modal akan dikembalikan.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showToast('Pengeluaran berhasil dihapus.', 'success');
          fetchExpenses();
          if (refreshDashboardData) refreshDashboardData();
        } else {
          const errorData = await response.json();
          showToast(`Gagal menghapus pengeluaran: ${errorData.error}`, 'error');
        }
      } catch (error) {
        showToast(`Terjadi kesalahan jaringan: ${error.message}`, 'error');
      }
    }
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingExpense(null);
  };

  const handleSaveEdit = () => {
    fetchExpenses();
    if (refreshDashboardData) refreshDashboardData();
    handleCloseEditModal();
  };

  return (
    <>
      <AddExpenseForm showToast={showToast} onExpenseAdded={() => { fetchExpenses(); if (refreshDashboardData) refreshDashboardData(); }} />
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          Daftar Pengeluaran
        </div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Deskripsi</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{expense.id}</td>
                    <td>{expense.description}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>{formatDate(expense.date)}</td>
                    <td>
                      <button className="btn btn-sm btn-info me-2" onClick={() => handleOpenEditModal(expense)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(expense.id)}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Tidak ada pengeluaran ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showEditModal && (
        <EditExpenseModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
          expense={editingExpense}
          showToast={showToast}
        />
      )}
    </>
  );
}

export default ExpenseContent;
