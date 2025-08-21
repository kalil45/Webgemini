import React from 'react';
import TransactionForm from './TransactionForm';

function AddTransactionContent({ showToast, onTransactionAdded }) {
  return (
    <>
      <TransactionForm showToast={showToast} onTransactionAdded={onTransactionAdded} />
    </>
  );
}

export default AddTransactionContent;