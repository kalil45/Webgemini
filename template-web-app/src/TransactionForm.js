import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './apiConfig';
import Receipt from './Receipt'; // Import the Receipt component

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

function TransactionForm({ showToast, onTransactionAdded }) {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    costprice: '',
    sellingPrice: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uangCash, setUangCash] = useState('');
  const [uangKembali, setUangKembali] = useState(0);
  const [transactionToPrint, setTransactionToPrint] = useState(null);

  const receiptRef = useRef(); // Keep ref for the receipt component
  const totalTransaksi = (formData.sellingPrice || 0) * (formData.quantity || 0);

  useEffect(() => {
    const cash = parseFloat(uangCash);
    if (!isNaN(cash) && cash >= totalTransaksi) {
      setUangKembali(cash - totalTransaksi);
    } else {
      setUangKembali(0);
    }
  }, [uangCash, totalTransaksi]);

  // More robust printing logic
  useEffect(() => {
    if (transactionToPrint) {
      const timer = setTimeout(() => {
        window.print();
        // Reset state after a delay to ensure printing is complete
        setTransactionToPrint(null);
        setFormData({
          productName: '',
          quantity: '',
          costprice: '',
          sellingPrice: '',
        });
        setErrors({});
        setSelectedProduct(null);
        setSearchQuery('');
        setUangCash('');
        setUangKembali(0);
      }, 500); // 500ms delay to allow render before print

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [transactionToPrint]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseRupiah(value);
    if (!isNaN(parsedValue) && parsedValue.length <= 15) {
      setFormData({ ...formData, [name]: parsedValue });
    }
  };

  const handleUangCashChange = (e) => {
    const { value } = e.target;
    const parsedValue = parseRupiah(value);
    if (!isNaN(parsedValue) && parsedValue.length <= 15) {
      setUangCash(parsedValue);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products?search=${query}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setSearchResults([]);
    setFormData({
      ...formData,
      productName: product.name,
      costprice: product.costprice || '',
      sellingPrice: product.price || '',
    });
  };

  const validate = () => {
    let tempErrors = {};
    if (!selectedProduct) {
      tempErrors.productName = true; // Mark product name as invalid
      showToast('Mohon pilih produk dari daftar yang tersedia. ⚠️', 'error');
      setErrors(tempErrors);
      return false;
    }

    if (!formData.productName) tempErrors.productName = true;
    if (!formData.quantity) tempErrors.quantity = true;
    if (!formData.costprice) tempErrors.costprice = true;
    if (!formData.sellingPrice) tempErrors.sellingPrice = true;
    if (uangCash === '' || parseFloat(uangCash) < totalTransaksi) tempErrors.uangCash = true;

    if (selectedProduct && selectedProduct.stock < parseInt(formData.quantity, 10)) {
      tempErrors.quantity = true; // Mark as invalid
      showToast(`Stok tidak mencukupi. Stok tersedia: ${selectedProduct.stock} ⚠️`, 'error');
      setErrors(tempErrors);
      return false; // Explicitly return false
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const transactionPayload = {
          productId: selectedProduct ? selectedProduct.id : null,
          productName: formData.productName,
          quantity: parseInt(formData.quantity, 10) || 0,
          costPrice: parseFloat(formData.costprice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          total: totalTransaksi,
        };
        console.log('Sending transaction payload:', transactionPayload);

        const response = await fetch(`${API_BASE_URL}/api/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionPayload),
        });

        if (response.ok) {
          showToast('Transaksi berhasil dicatat! ✅', 'success');
          
          setTransactionToPrint({
            transaction: transactionPayload,
            uangCash: parseFloat(uangCash),
            uangKembali: uangKembali,
          });

          if (onTransactionAdded) {
            onTransactionAdded();
          }
        } else {
          const errorData = await response.json();
          showToast(`Gagal mencatat transaksi: ${errorData.error} ⚠️`, 'error');
        }
      } catch (error) {
        showToast(`Terjadi kesalahan jaringan: ${error.message} ⚠️`, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Mohon lengkapi semua kolom dan pastikan uang cash cukup. ⚠️', 'error');
    }
  };

  return (
    <div>
      <div class="transaction-form-container">
        <div class="card shadow-sm mb-4">
        <div class="card-header">
          Entri Transaksi Baru
        </div>
        <div class="card-body">
          <form onSubmit={handleSubmit}>
            <div class="mb-3">
            <label htmlFor="productName" class="form-label">Nama Produk</label>
            <input
              type="text"
              class={`form-control ${errors.productName ? 'is-invalid' : ''}`}
              id="productName"
              name="productName"
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading}
              autoComplete="off"
            />
            {errors.productName && <div class="invalid-feedback">Nama Produk tidak boleh kosong.</div>}
            {searchResults.length > 0 && (
              <ul class="list-group mt-2">
                {searchResults.map((product) => (
                  <li
                    key={product.id}
                    class="list-group-item list-group-item-action"
                    onClick={() => handleProductSelect(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name} (Stok: {product.stock})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div class="mb-3">
            <label htmlFor="quantity" class="form-label">Jumlah</label>
            <input
              type="number"
              class={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.quantity && <div class="invalid-feedback">Jumlah tidak boleh kosong.</div>}
          </div>
          <div class="mb-3">
            <label htmlFor="costPrice" class="form-label">Harga Modal</label>
            <div class="input-group">
              <span class="input-group-text">Rp </span>
              <input
                type="text"
                class={`form-control ${errors.costprice ? 'is-invalid' : ''}`}
                id="costPrice"
                name="costprice"
                value={formatRupiah(formData.costprice)}
                onChange={handleCurrencyChange}
                disabled={loading}
              />
            </div>
            {errors.costprice && <div class="invalid-feedback d-block">Harga Modal tidak boleh kosong.</div>}
          </div>
          <div class="mb-3">
            <label htmlFor="sellingPrice" class="form-label">Harga Jual</label>
            <div class="input-group">
              <span class="input-group-text">Rp </span>
              <input
                type="text"
                class={`form-control ${errors.sellingPrice ? 'is-invalid' : ''}`}
                id="sellingPrice"
                name="sellingPrice"
                value={formatRupiah(formData.sellingPrice)}
                onChange={handleCurrencyChange}
                disabled={loading}
              />
            </div>
            {errors.sellingPrice && <div class="invalid-feedback d-block">Harga Jual tidak boleh kosong.</div>}
          </div>
          <div class="mb-3">
            <label htmlFor="totalTransaksi" class="form-label">Total Transaksi</label>
            <input
              type="text"
              class="form-control"
              id="totalTransaksi"
              value={`${totalTransaksi.toLocaleString('id-ID')}`}
              disabled
            />
          </div>
          <div class="mb-3">
            <label htmlFor="uangCash" class="form-label">Uang Cash</label>
            <div class="input-group">
              <span class="input-group-text">Rp </span>
              <input
                type="text"
                class={`form-control ${errors.uangCash ? 'is-invalid' : ''}`}
                id="uangCash"
                name="uangCash"
                value={formatRupiah(uangCash)}
                onChange={handleUangCashChange}
                disabled={loading}
              />
            </div>
            {errors.uangCash && <div class="invalid-feedback d-block">Uang Cash tidak boleh kosong dan harus cukup.</div>}
          </div>
          <div class="mb-3">
            <label htmlFor="uangKembali" class="form-label">Uang Kembali</label>
            <input
              type="text"
              class="form-control"
              id="uangKembali"
              value={`${uangKembali.toLocaleString('id-ID')}`}
              disabled
            />
          </div>
            <button type="submit" class="btn btn-primary" disabled={loading}>
              {loading ? (
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                'Catat Transaksi & Cetak'
              )}
            </button>
          </form>
        </div>
      </div>
      </div>
      <div class="receipt-container">
        {transactionToPrint && (
          <Receipt
            ref={receiptRef}
            transactionData={transactionToPrint}
            businessDetails={businessDetails}
          />
        )}
      </div>
    </div>
  );
}

export default TransactionForm;
