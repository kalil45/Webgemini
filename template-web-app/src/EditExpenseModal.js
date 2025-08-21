import React, { useState, useEffect } from 'react';

// Helper functions for currency formatting
const formatRupiah = (number) => {
  if (number === '' || isNaN(number)) return '';
  const numStr = String(number).replace(/^0+/, '');
  if (numStr === '') return '0';
  return new Intl.NumberFormat('id-ID').format(numStr);
};

const parseRupiah = (formattedString) => {
  return formattedString.replace(/\./g, '');
};

function EditExpenseModal({ show, onClose, onSave, expense, showToast }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount || '',
      });
    }
  }, [expense]);

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseRupiah(value);
    if (!isNaN(parsedValue) && parsedValue.length <= 15) {
      setFormData({ ...formData, [name]: parsedValue });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        showToast('Pengeluaran berhasil diperbarui! ✅', 'success');
        onSave(); // Refresh data and close modal
      } else {
        const errorData = await response.json();
        showToast(`Gagal memperbarui pengeluaran: ${errorData.error} ⚠️`, 'error');
      }
    } catch (error) {
      showToast(`Terjadi kesalahan jaringan: ${error.message} ⚠️`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Pengeluaran</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Deskripsi</label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="amount" className="form-label">Jumlah</label>
                <div className="input-group">
                    <span className="input-group-text">Rp</span>
                    <input
                        type="text"
                        className="form-control"
                        id="amount"
                        name="amount"
                        value={formatRupiah(formData.amount)}
                        onChange={handleCurrencyChange}
                    />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditExpenseModal;
