import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from './apiConfig';

function SalesChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const transactions = await response.json();
        const aggregatedData = aggregateSalesByDay(transactions);
        setChartData(aggregatedData);
      } else {
        console.error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const aggregateSalesByDay = (transactions) => {
    const salesMap = new Map();

    transactions.forEach(transaction => {
      const date = transaction.date; // Assuming date is in YYYY-MM-DD format
      const total = parseFloat(transaction.total || 0);

      if (salesMap.has(date)) {
        salesMap.set(date, salesMap.get(date) + total);
      } else {
        salesMap.set(date, total);
      }
    });

    // Sort by date and format for recharts
    const sortedDates = Array.from(salesMap.keys()).sort();
    return sortedDates.map(date => ({ name: formatDate(date), penjualan: salesMap.get(date) }));
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        Grafik Penjualan
      </div>
      <div className="card-body" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="penjualan" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesChart;