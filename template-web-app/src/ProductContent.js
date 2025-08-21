import React, { useState, useEffect } from 'react';
import AddProductForm from './AddProductForm';

function ProductContent({ showToast }) {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        showToast('Gagal mengambil data produk.', 'error');
      }
    } catch (error) {
      showToast(`Error mengambil data produk: ${error.message}`, 'error');
    }
  };

  const handleEditStock = (productId, currentStock) => {
    setEditingProductId(productId);
    setNewStock(currentStock);
  };

  const handleUpdateStock = async (productId) => {
    if (newStock === '' || isNaN(newStock) || parseInt(newStock) < 0) {
      showToast('Mohon masukkan stok yang valid.', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stock: parseInt(newStock) }),
        }
      );

      if (response.ok) {
        showToast('Stok berhasil diperbarui! ✅', 'success');
        setEditingProductId(null);
        setNewStock('');
        fetchProducts(); // Refresh the product list
      } else {
        const errorData = await response.json();
        showToast(`Gagal memperbarui stok: ${errorData.error} ⚠️`, 'error');
      }
    } catch (error) {
      showToast(`Terjadi kesalahan jaringan: ${error.message} ⚠️`, 'error');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini? Ini tidak dapat dilakukan jika produk sudah memiliki riwayat transaksi.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showToast('Produk berhasil dihapus.', 'success');
          fetchProducts(); // Refresh the product list
        } else {
          const errorData = await response.json();
          showToast(`Gagal menghapus produk: ${errorData.error}`, 'error');
        }
      } catch (error) {
        showToast(`Terjadi kesalahan jaringan: ${error.message}`, 'error');
      }
    }
  };

  return (
    <>
      <AddProductForm showToast={showToast} onProductAdded={fetchProducts} />
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          Daftar Produk
        </div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Produk</th>
                <th>Stok</th>
                <th>Harga Modal</th>
                <th>Harga Jual</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>
                      {editingProductId === product.id ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                        />
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>Rp {product.costPrice ? product.costPrice.toLocaleString('id-ID') : 'N/A'}</td>
                    <td>Rp {product.price ? product.price.toLocaleString('id-ID') : 'N/A'}</td>
                    <td>
                      {editingProductId === product.id ? (
                        <>
                          <button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateStock(product.id)}>Simpan</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => setEditingProductId(null)}>Batal</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-info me-2" onClick={() => handleEditStock(product.id, product.stock)}>Edit Stok</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>Hapus</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">Tidak ada produk ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ProductContent;