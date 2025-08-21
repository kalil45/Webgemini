import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

function ToastNotification({ message, type, show, onClose }) {
  const [bgClass, setBgClass] = useState('');

  useEffect(() => {
    if (type === 'success') {
      setBgClass('bg-success');
    } else if (type === 'error') {
      setBgClass('bg-danger');
    } else {
      setBgClass('bg-info'); // Default or for other types
    }
  }, [type]);

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
      <Toast show={show} onClose={onClose} delay={3000} autohide>
        <Toast.Header className={`${bgClass} text-white`}>
          <strong className="me-auto">{type === 'success' ? 'Success' : 'Error'}</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default ToastNotification;
