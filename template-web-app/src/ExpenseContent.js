import React, { useState, useEffect } from 'react';
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
      const response = await fetch('http://localhost:5000/api/expenses');
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

  const handleDelete = async (expenseId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini? Modal akan dikembalikan.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
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
                    <td>Rp {expense.amount.toLocaleString('id-ID')}</td>
                    <td>{expense.date}</td>
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