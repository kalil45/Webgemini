import React, { useState } from 'react';
import { API_BASE_URL } from './apiConfig';

function AddExpenseForm({ showToast, onExpenseAdded }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.description) tempErrors.description = true;
    if (!formData.amount) tempErrors.amount = true;
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showToast('Pengeluaran berhasil dicatat! ✅', 'success');
          setFormData({
            description: '',
            amount: '',
          });
          setErrors({});
          if (onExpenseAdded) {
            onExpenseAdded(); // Callback to refresh expense list and dashboard
          }
        } else {
          const errorData = await response.json();
          showToast(`Gagal mencatat pengeluaran: ${errorData.error} ⚠️`, 'error');
        }
      } catch (error) {
        showToast(`Terjadi kesalahan jaringan: ${error.message} ⚠️`, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Mohon lengkapi semua kolom. ⚠️', 'error');
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        Catat Pengeluaran Baru
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Deskripsi Pengeluaran</label>
            <input
              type="text"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.description && <div className="invalid-feedback">Deskripsi tidak boleh kosong.</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="amount" className="form-label">Jumlah</label>
            <input
              type="number"
              className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.amount && <div className="invalid-feedback">Jumlah tidak boleh kosong.</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Catat Pengeluaran'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseForm;
