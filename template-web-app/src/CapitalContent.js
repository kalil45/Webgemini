import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './apiConfig';

function CapitalContent({ refreshDashboardData }) {
  const [currentCapital, setCurrentCapital] = useState(0); // Initialized to 0, will fetch from backend
  const [showAddModalForm, setShowAddModalForm] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');

  useEffect(() => {
    fetchTotalCapital();
  }, []);

  const fetchTotalCapital = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/capital/total`);
      if (response.ok) {
        const data = await response.json();
        setCurrentCapital(parseFloat(data.totalCapital));
      } else {
        console.error('Failed to fetch total capital');
      }
    } catch (error) {
      console.error('Error fetching total capital:', error);
    }
  };

  const handleAddCapital = async () => {
    if (amountToAdd && !isNaN(amountToAdd) && parseFloat(amountToAdd) > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/capital`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: parseFloat(amountToAdd), type: 'add' }),
        });

        if (response.ok) {
          alert(`Modal berhasil ditambahkan: Rp ${parseFloat(amountToAdd).toLocaleString('id-ID')}`);
          setAmountToAdd('');
          setShowAddModalForm(false);
          fetchTotalCapital(); // Refresh total capital
          if (refreshDashboardData) {
            refreshDashboardData(); // Refresh dashboard summary cards
          }
        } else {
          const errorData = await response.json();
          alert(`Gagal menambahkan modal: ${errorData.error}`);
        }
      } catch (error) {
        alert(`Terjadi kesalahan jaringan: ${error.message}`);
      }
    } else {
      alert('Mohon masukkan jumlah yang valid.');
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        Modal Tersedia
      </div>
      <div className="card-body">
        <h5 className="card-title">Modal Saat Ini:</h5>
        <p className="card-text fs-3">Rp {currentCapital.toLocaleString('id-ID')}</p>
        
        <button className="btn btn-primary mt-3" onClick={() => setShowAddModalForm(true)}>
          Tambah Modal
        </button>

        {showAddModalForm && (
          <div className="mt-3 p-3 border rounded">
            <h6>Tambahkan Modal Baru</h6>
            <div className="mb-3">
              <label htmlFor="amountToAdd" className="form-label">Jumlah Modal</label>
              <input
                type="number"
                className="form-control"
                id="amountToAdd"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
              />
            </div>
            <button className="btn btn-success me-2" onClick={handleAddCapital}>Tambahkan</button>
            <button className="btn btn-secondary" onClick={() => setShowAddModalForm(false)}>Batal</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CapitalContent;
