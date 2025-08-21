import React from 'react';

const Receipt = React.forwardRef(({ transactionData, businessDetails }, ref) => {
  // Default to empty strings if props are not provided, to avoid errors
  const { productName = '', quantity = 0, sellingPrice = 0, total = 0 } = transactionData.transaction || {};
  const { uangCash = 0, uangKembali = 0 } = transactionData;

  const receiptStyle = {
    width: '220px', // Approx 58mm
    padding: '10px',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '12px',
    color: '#000',
  };

  const headerStyle = {
    textAlign: 'center',
    margin: '0',
    fontSize: '14px',
    fontWeight: 'bold',
  };
  
  const subHeaderStyle = {
    textAlign: 'center',
    margin: '0',
    fontSize: '10px',
  };

  const sectionStyle = {
    margin: '5px 0',
  };

  const hrStyle = {
    border: 'none',
    borderTop: '1px dashed #000',
    margin: '5px 0',
  };

  const flexBetween = {
    display: 'flex',
    justifyContent: 'space-between',
  };

  return (
    <div ref={ref} style={receiptStyle}>
      <h2 style={headerStyle}>{businessDetails.name}</h2>
      <p style={subHeaderStyle}>{businessDetails.address}</p>
      <p style={subHeaderStyle}>{businessDetails.phone}</p>
      <hr style={hrStyle} />
      <div style={sectionStyle}>
        <p>Tgl: {new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
      </div>
      <hr style={hrStyle} />
      <div style={sectionStyle}>
        <p style={{ margin: '0' }}><strong>{productName}</strong></p>
        <div style={flexBetween}>
          <span>{quantity} x @{sellingPrice.toLocaleString('id-ID')}</span>
          <span>Rp{total.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <hr style={hrStyle} />
      <div style={sectionStyle}>
        <div style={flexBetween}>
          <strong>Total:</strong>
          <strong>Rp{total.toLocaleString('id-ID')}</strong>
        </div>
        <div style={flexBetween}>
          <span>Cash:</span>
          <span>Rp{uangCash.toLocaleString('id-ID')}</span>
        </div>
        <div style={flexBetween}>
          <span>Kembali:</span>
          <span>Rp{uangKembali.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <hr style={hrStyle} />
      <p style={{ textAlign: 'center', margin: '0', fontSize: '10px' }}>
        Terima kasih telah berbelanja!
      </p>
    </div>
  );
});

export default Receipt;