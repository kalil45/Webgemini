import React, { useState, useEffect } from 'react';

function SummaryCards({ showToast }) {
  const [totalSalesToday, setTotalSalesToday] = useState(0);
  const [totalProfitToday, setTotalProfitToday] = useState(0);
  const [totalProductsSoldToday, setTotalProductsSoldToday] = useState(0);
  const [remainingCapital, setRemainingCapital] = useState(0); // Will fetch from backend

  useEffect(() => {
    fetchAndCalculateSummary();
    fetchTotalCapital();
  }, []);

  const fetchAndCalculateSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions');
      if (response.ok) {
        const transactions = await response.json();
        calculateSummary(transactions);
      } else {
        showToast('Gagal mengambil data ringkasan.', 'error');
      }
    } catch (error) {
      showToast(`Error mengambil data ringkasan: ${error.message}`, 'error');
    }
  };

  const fetchTotalCapital = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/capital/total');
      if (response.ok) {
        const data = await response.json();
        setRemainingCapital(data.totalCapital);
      } else {
        showToast('Gagal mengambil data modal.', 'error');
      }
    } catch (error) {
      showToast(`Error mengambil data modal: ${error.message}`, 'error');
    }
  };

  const calculateSummary = (transactions) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    let sales = 0;
    let profit = 0;
    let productsSold = 0;

    transactions.forEach(transaction => {
      if (transaction.date === today) {
        sales += transaction.total;
        profit += transaction.profitPerUnit * transaction.quantity;
        productsSold += transaction.quantity;
      }
    });

    setTotalSalesToday(sales);
    setTotalProfitToday(profit);
    setTotalProductsSoldToday(productsSold);
  };

  const cardData = [
    {
      icon: '💰',
      title: 'Total Penjualan Hari Ini',
      value: `Rp ${totalSalesToday.toLocaleString('id-ID')}`,
      color: 'primary',
    },
    {
      icon: '📈',
      title: 'Total Laba Hari Ini',
      value: `Rp ${totalProfitToday.toLocaleString('id-ID')}`,
      color: 'success',
    },
    {
      icon: '📦',
      title: 'Jumlah Produk Terjual',
      value: `${totalProductsSoldToday} item`,
      color: 'warning',
    },
    {
      icon: '💳',
      title: 'Modal Tersisa',
      value: `Rp ${remainingCapital.toLocaleString('id-ID')}`,
      color: 'info',
    },
  ];

  return (
    <div className="row">
      {cardData.map((card, index) => (
        <div key={index} className="col-md-3 mb-4">
          <div className={`card text-white bg-${card.color} mb-3`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="me-3">
                  <div className="text-white-75 small">{card.title}</div>
                  <div className="text-white fw-bold fs-4">{card.value}</div>
                </div>
                <i className="fs-1">{card.icon}</i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
