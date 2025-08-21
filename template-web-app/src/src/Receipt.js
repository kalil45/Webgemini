import React from 'react';

const Receipt = React.forwardRef(({ transactionData, businessDetails }, ref) => {
  // Default to empty strings if props are not provided, to avoid errors
  const { productName = '', quantity = 0, sellingPrice = 0, total = 0 } = transactionData.transaction || {};
  const { uangCash = 0, uangKembali = 0 } = transactionData;

  return (
    <div ref={ref} style={{ width: '300px', padding: '20px', fontFamily: 'monospace', color: '#000' }}>
      <h2 style={{ textAlign: 'center', margin: '0' }}>{businessDetails.name}</h2>
      <p style={{ textAlign: 'center', margin: '0' }}>{businessDetails.address}</p>
      <p style={{ textAlign: 'center', margin: '0' }}>{businessDetails.phone}</p>
      <hr style={{ borderStyle: 'dashed' }} />
      <p>Tanggal: {new Date().toLocaleString('id-ID')}</p>
      <hr style={{ borderStyle: 'dashed' }} />
      <div>
        <p style={{ margin: '0' }}><strong>{productName}</strong></p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{quantity} x Rp{sellingPrice.toLocaleString('id-ID')}</span>
          <span>Rp{(quantity * sellingPrice).toLocaleString('id-ID')}</span>
        </div>
      </div>
      <hr style={{ borderStyle: 'dashed' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>Total:</strong>
        <strong>Rp{total.toLocaleString('id-ID')}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Cash:</span>
        <span>Rp{uangCash.toLocaleString('id-ID')}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Kembali:</span>
        <span>Rp{uangKembali.toLocaleString('id-ID')}</span>
      </div>
      <hr style={{ borderStyle: 'dashed' }} />
      <p style={{ textAlign: 'center', margin: '0' }}>Terima kasih telah berbelanja!</p>
    </div>
  );
});

export default Receipt;
