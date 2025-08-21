import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SalesChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions');
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

  const aggregateSalesByDay = (transactions) => {
    const salesMap = new Map();

    transactions.forEach(transaction => {
      const date = transaction.date; // Assuming date is in YYYY-MM-DD format
      const total = transaction.total;

      if (salesMap.has(date)) {
        salesMap.set(date, salesMap.get(date) + total);
      } else {
        salesMap.set(date, total);
      }
    });

    // Sort by date and format for recharts
    const sortedDates = Array.from(salesMap.keys()).sort();
    return sortedDates.map(date => ({ name: date, penjualan: salesMap.get(date) }));
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
            <YAxis tickFormatter={(value) => `${value.toLocaleString('id-ID')}`} />
            <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
            <Legend />
            <Line type="monotone" dataKey="penjualan" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesChart;
