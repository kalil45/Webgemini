import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './apiConfig';
import Receipt from './Receipt'; // Import the receipt component

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

const businessDetails = {
    name: 'RD CELL',
    address: 'Jl. Medan- Banda Aceh Kabupaten Aceh Utara.',
    phone: '0852 7720 7367',
};

function EditTransactionModal({ show, onClose, onSave, transaction, showToast }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [transactionToPrint, setTransactionToPrint] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    if (transaction) {
      setFormData({
        quantity: transaction.quantity || '',
        costPrice: transaction.costprice || '',
        sellingPrice: transaction.sellingprice || '',
      });
    }
  }, [transaction]);

  useEffect(() => {
    if (transactionToPrint) {
      const timer = setTimeout(() => {
        window.print();
        onSave(); // This will close the modal and refresh the list
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [transactionToPrint, onSave]);

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
      const updatedData = {
        quantity: parseInt(formData.quantity, 10),
        costprice: parseFloat(formData.costprice || 0),
        sellingPrice: parseFloat(formData.sellingPrice || 0),
      };

      const response = await fetch(`${API_BASE_URL}/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        showToast('Transaksi berhasil diperbarui! ✅', 'success');
        
        const updatedTransactionForReceipt = {
            ...transaction,
            ...updatedData,
            total: updatedData.quantity * updatedData.sellingPrice,
        };

        // For printing, we'll assume cash paid is the new total and change is 0
        setTransactionToPrint({
            transaction: updatedTransactionForReceipt,
            uangCash: updatedTransactionForReceipt.total,
            uangKembali: 0,
        });

      } else {
        const errorData = await response.json();
        showToast(`Gagal memperbarui transaksi: ${errorData.error} ⚠️`, 'error');
        setLoading(false);
      }
    } catch (error) {
      showToast(`Terjadi kesalahan jaringan: ${error.message} ⚠️`, 'error');
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Transaksi</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>Nama Produk</label>
                  <input type="text" className="form-control" value={transaction?.productname || ''} disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">Jumlah</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="costPrice" className="form-label">Harga Modal</label>
                  <div className="input-group">
                      <span className="input-group-text">Rp</span>
                      <input
                          type="text"
                          className="form-control"
                          id="costPrice"
                          name="costPrice"
                          value={formatRupiah(formData.costPrice)}
                          onChange={handleCurrencyChange}
                      />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="sellingPrice" className="form-label">Harga Jual</label>
                  <div className="input-group">
                      <span className="input-group-text">Rp</span>
                      <input
                          type="text"
                          className="form-control"
                          id="sellingPrice"
                          name="sellingPrice"
                          value={formatRupiah(formData.sellingPrice)}
                          onChange={handleCurrencyChange}
                      />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan & Cetak'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="receipt-container">
        {transactionToPrint && (
          <Receipt
            ref={receiptRef}
            transactionData={transactionToPrint}
            businessDetails={businessDetails}
          />
        )}
      </div>
    </>
  );
}

export default EditTransactionModal;