const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Helper function to get local date in YYYY-MM-DD format
const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Connect to SQLite database
db = new sqlite3.Database('./transactions.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create tables if they don't exist
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        costPrice REAL NOT NULL,
        sellingPrice REAL NOT NULL,
        profitPerUnit REAL,
        total REAL,
        date TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        stock INTEGER NOT NULL,
        price REAL NOT NULL,
        costPrice REAL NOT NULL
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS capital_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL
      )`);
    });
  }
});

// TRANSACTIONS API
app.post('/api/transactions', (req, res) => {
  const { productName, quantity, costPrice, sellingPrice } = req.body;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const getProductSql = `SELECT * FROM products WHERE name = ?`;
    db.get(getProductSql, [productName], (err, product) => {
      if (err) {
        db.run('ROLLBACK;');
        return res.status(500).json({ error: err.message });
      }
      if (!product) {
        db.run('ROLLBACK;');
        return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      }
      if (product.stock < quantity) {
        db.run('ROLLBACK;');
        return res.status(400).json({ error: 'Stok tidak mencukupi.' });
      }
      const newStock = product.stock - quantity;
      const updateStockSql = `UPDATE products SET stock = ? WHERE name = ?`;
      db.run(updateStockSql, [newStock, productName], function(err) {
        if (err) {
          db.run('ROLLBACK;');
          return res.status(500).json({ error: err.message });
        }
        const profitPerUnit = sellingPrice - costPrice;
        const total = quantity * sellingPrice;
        const date = getLocalDate();
        const insertTransactionSql = `INSERT INTO transactions (productName, quantity, costPrice, sellingPrice, profitPerUnit, total, date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.run(insertTransactionSql, [productName, quantity, costPrice, sellingPrice, profitPerUnit, total, date], function(err) {
          if (err) {
            db.run('ROLLBACK;');
            return res.status(400).json({ error: err.message });
          }
          const lastID = this.lastID;
          db.run('COMMIT;', (err) => {
            if (err) {
              console.error('Commit failed:', err.message);
              return res.status(500).json({ error: 'Gagal menyimpan transaksi.' });
            }
            res.status(201).json({ id: lastID });
          });
        });
      });
    });
  });
});

app.get('/api/transactions', (req, res) => {
  const { startDate, endDate } = req.query;
  let sql = `SELECT * FROM transactions`;
  const params = [];

  if (startDate && endDate) {
    sql += ' WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  sql += ' ORDER BY date DESC, id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const getTransactionSql = `SELECT * FROM transactions WHERE id = ?`;
    db.get(getTransactionSql, [id], (err, transaction) => {
      if (err) {
        db.run('ROLLBACK;');
        return res.status(500).json({ error: err.message });
      }
      if (!transaction) {
        db.run('ROLLBACK;');
        return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
      }
      const updateStockSql = `UPDATE products SET stock = stock + ? WHERE name = ?`;
      db.run(updateStockSql, [transaction.quantity, transaction.productName], function(err) {
        if (err) {
          db.run('ROLLBACK;');
          return res.status(500).json({ error: err.message });
        }
        const deleteTransactionSql = `DELETE FROM transactions WHERE id = ?`;
        db.run(deleteTransactionSql, [id], function(err) {
          if (err) {
            db.run('ROLLBACK;');
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            db.run('ROLLBACK;');
            return res.status(404).json({ error: 'Gagal menghapus transaksi.' });
          }
          db.run('COMMIT;', (err) => {
            if (err) {
              console.error('Commit failed:', err.message);
              return res.status(500).json({ error: 'Gagal menyimpan perubahan.' });
            }
            res.json({ message: 'Transaksi berhasil dihapus dan stok dikembalikan.' });
          });
        });
      });
    });
  });
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { quantity, costPrice, sellingPrice } = req.body;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const getTransactionSql = `SELECT * FROM transactions WHERE id = ?`;
    db.get(getTransactionSql, [id], (err, originalTransaction) => {
      if (err) {
        db.run('ROLLBACK;');
        return res.status(500).json({ error: err.message });
      }
      if (!originalTransaction) {
        db.run('ROLLBACK;');
        return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
      }
      const quantityDifference = quantity - originalTransaction.quantity;
      const getProductSql = `SELECT * FROM products WHERE name = ?`;
      db.get(getProductSql, [originalTransaction.productName], (err, product) => {
        if (err) {
          db.run('ROLLBACK;');
          return res.status(500).json({ error: err.message });
        }
        if (!product) {
          db.run('ROLLBACK;');
          return res.status(404).json({ error: 'Produk tidak ditemukan.' });
        }
        if (product.stock < quantityDifference) {
          db.run('ROLLBACK;');
          return res.status(400).json({ error: 'Stok tidak mencukupi untuk pembaruan ini.' });
        }
        const newStock = product.stock - quantityDifference;
        const updateStockSql = `UPDATE products SET stock = ? WHERE name = ?`;
        db.run(updateStockSql, [newStock, originalTransaction.productName], function(err) {
          if (err) {
            db.run('ROLLBACK;');
            return res.status(500).json({ error: err.message });
          }
          const newTotal = quantity * sellingPrice;
          const newProfitPerUnit = sellingPrice - costPrice;
          const updateTransactionSql = `UPDATE transactions SET quantity = ?, costPrice = ?, sellingPrice = ?, total = ?, profitPerUnit = ? WHERE id = ?`;
          db.run(updateTransactionSql, [quantity, costPrice, sellingPrice, newTotal, newProfitPerUnit, id], function(err) {
            if (err) {
              db.run('ROLLBACK;');
              return res.status(400).json({ error: err.message });
            }
            db.run('COMMIT;', (err) => {
              if (err) {
                console.error('Commit failed:', err.message);
                return res.status(500).json({ error: 'Gagal menyimpan pembaruan transaksi.' });
              }
              res.json({ message: 'Transaksi berhasil diperbarui.' });
            });
          });
        });
      });
    });
  });
});

// PRODUCTS API
app.post('/api/products', (req, res) => {
  const { name, stock, price, costPrice } = req.body;
  const sql = `INSERT INTO products (name, stock, price, costPrice) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, stock, price, costPrice], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.get('/api/products', (req, res) => {
  const { search } = req.query;
  let sql = `SELECT * FROM products`;
  let params = [];
  if (search) {
    sql += ` WHERE name LIKE ?`;
    params.push(`%${search}%`);
  }
  sql += ` ORDER BY name ASC`;
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const sql = `UPDATE products SET stock = ? WHERE id = ?`;
  db.run(sql, [stock, id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found.' });
    } else {
      res.json({ message: 'Product stock updated successfully.' });
    }
  });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  const getProductSql = `SELECT name FROM products WHERE id = ?`;
  db.get(getProductSql, [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    const productName = product.name;

    const checkTransactionSql = `SELECT 1 FROM transactions WHERE productName = ? LIMIT 1`;
    db.get(checkTransactionSql, [productName], (err, transaction) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (transaction) {
        return res.status(400).json({ error: 'Tidak dapat menghapus produk karena sudah ada transaksi terkait.' });
      }

      const deleteProductSql = `DELETE FROM products WHERE id = ?`;
      db.run(deleteProductSql, [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Gagal menghapus produk.' });
        }
        res.json({ message: 'Produk berhasil dihapus.' });
      });
    });
  });
});

// EXPENSES API
app.post('/api/expenses', (req, res) => {
  const { description, amount } = req.body;
  const date = getLocalDate();
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const sqlExpense = `INSERT INTO expenses (description, amount, date) VALUES (?, ?, ?)`;
    db.run(sqlExpense, [description, amount, date], function (err) {
      if (err) {
        db.run('ROLLBACK;');
        return res.status(400).json({ error: err.message });
      }
      const sqlCapital = `INSERT INTO capital_history (amount, date, type) VALUES (?, ?, ?)`;
      db.run(sqlCapital, [amount, date, 'subtract'], (errCapital) => {
        if (errCapital) {
          db.run('ROLLBACK;');
          return res.status(500).json({ error: errCapital.message });
        }
        db.run('COMMIT;', (errCommit) => {
          if (errCommit) {
            return res.status(500).json({ error: 'Gagal menyimpan perubahan modal.' });
          }
          res.status(201).json({ id: this.lastID });
        });
      });
    });
  });
});

app.get('/api/expenses', (req, res) => {
  const { startDate, endDate } = req.query;
  let sql = `SELECT * FROM expenses`;
  const params = [];

  if (startDate && endDate) {
    sql += ' WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  sql += ' ORDER BY date DESC, id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { description, amount } = req.body;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const getExpenseSql = `SELECT * FROM expenses WHERE id = ?`;
    db.get(getExpenseSql, [id], (err, originalExpense) => {
      if (err) {
        db.run('ROLLBACK;');
        return res.status(500).json({ error: err.message });
      }
      if (!originalExpense) {
        db.run('ROLLBACK;');
        return res.status(404).json({ error: 'Expense not found.' });
      }
      const addCapitalSql = `INSERT INTO capital_history (amount, date, type) VALUES (?, ?, ?)`;
      db.run(addCapitalSql, [originalExpense.amount, originalExpense.date, 'add'], (errAdd) => {
        if (errAdd) {
          db.run('ROLLBACK;');
          return res.status(500).json({ error: errAdd.message });
        }
        const subtractCapitalSql = `INSERT INTO capital_history (amount, date, type) VALUES (?, ?, ?)`;
        db.run(subtractCapitalSql, [amount, originalExpense.date, 'subtract'], (errSubtract) => {
          if (errSubtract) {
            db.run('ROLLBACK;');
            return res.status(500).json({ error: errSubtract.message });
          }
          const updateExpenseSql = `UPDATE expenses SET description = ?, amount = ? WHERE id = ?`;
          db.run(updateExpenseSql, [description, amount, id], function(err) {
            if (err) {
              db.run('ROLLBACK;');
              return res.status(400).json({ error: err.message });
            }
            db.run('COMMIT;', (errCommit) => {
              if (errCommit) {
                return res.status(500).json({ error: 'Failed to commit expense update.' });
              }
              res.json({ message: 'Expense updated successfully.' });
            });
          });
        });
      });
    });
  });
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    const getExpenseSql = `SELECT * FROM expenses WHERE id = ?`;
    db.get(getExpenseSql, [id], (err, expense) => {
      if (err) {
        db.run('ROLLBACK;');
        return res.status(500).json({ error: err.message });
      }
      if (!expense) {
        db.run('ROLLBACK;');
        return res.status(404).json({ error: 'Expense not found.' });
      }
      const sqlCapital = `INSERT INTO capital_history (amount, date, type) VALUES (?, ?, ?)`;
      db.run(sqlCapital, [expense.amount, expense.date, 'add'], (errCapital) => {
        if (errCapital) {
          db.run('ROLLBACK;');
          return res.status(500).json({ error: errCapital.message });
        }
        const deleteExpenseSql = `DELETE FROM expenses WHERE id = ?`;
        db.run(deleteExpenseSql, [id], function(err) {
          if (err) {
            db.run('ROLLBACK;');
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            db.run('ROLLBACK;');
            return res.status(404).json({ error: 'Failed to delete expense.' });
          }
          db.run('COMMIT;', (errCommit) => {
            if (errCommit) {
              return res.status(500).json({ error: 'Failed to commit changes.' });
            }
            res.json({ message: 'Expense deleted successfully and capital restored.' });
          });
        });
      });
    });
  });
});

// CAPITAL API
app.post('/api/capital', (req, res) => {
  const { amount, type } = req.body;
  const date = getLocalDate();
  const sql = `INSERT INTO capital_history (amount, date, type) VALUES (?, ?, ?)`;
  db.run(sql, [amount, date, type], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.get('/api/capital/total', (req, res) => {
  const sql = `SELECT SUM(CASE WHEN type = 'add' THEN amount ELSE -amount END) AS totalCapital FROM capital_history`;
  db.get(sql, [], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    const totalCapital = row.totalCapital || 0;
    res.json({ totalCapital });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
