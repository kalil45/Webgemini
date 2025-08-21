import React, { useState } from 'react';

function AddProductForm({ showToast, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    price: '',
    costPrice: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = true;
    if (!formData.stock) tempErrors.stock = true;
    if (!formData.price) tempErrors.price = true;
    if (!formData.costPrice) tempErrors.costPrice = true;
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showToast('Produk berhasil ditambahkan! ✅', 'success');
          setFormData({
            name: '',
            stock: '',
            price: '',
            costPrice: '',
          });
          setErrors({});
          if (onProductAdded) {
            onProductAdded(); // Callback to refresh product list
          }
        } else {
          const errorData = await response.json();
          showToast(`Gagal menambahkan produk: ${errorData.error} ⚠️`, 'error');
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
        Tambah Produk Baru
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">Nama Produk</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              id="productName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <div className="invalid-feedback">Nama Produk tidak boleh kosong.</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="stock" className="form-label">Stok</label>
            <input
              type="number"
              className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.stock && <div className="invalid-feedback">Stok tidak boleh kosong.</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="price" className="form-label">Harga Jual</label>
            <input
              type="number"
              className={`form-control ${errors.price ? 'is-invalid' : ''}`}
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.price && <div className="invalid-feedback">Harga Jual tidak boleh kosong.</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="costPrice" className="form-label">Harga Modal</label>
            <input
              type="number"
              className={`form-control ${errors.costPrice ? 'is-invalid' : ''}`}
              id="costPrice"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.costPrice && <div className="invalid-feedback">Harga Modal tidak boleh kosong.</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Tambah Produk'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProductForm;
