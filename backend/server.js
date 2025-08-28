const { quantity, costPrice, sellingPrice } = req.body;
const client = await pool.connect();

try {
await client.query('BEGIN');

const transactionRes = await client.query('SELECT *
const originalTransaction = transactionRes.rows[0];

if (!originalTransaction) {
throw new Error('Transaksi tidak ditemukan.');
}

const quantityDifference = quantity - originalTransa

const productRes = await client.query('SELECT * FROM
const product = productRes.rows[0];

if (!product) {
throw new Error('Produk tidak ditemukan.');
}
if (product.stock < quantityDifference) {
throw new Error('Stok tidak mencukupi untuk pemb
}

const newStock = product.stock - quantityDifference;
await client.query('UPDATE products SET stock = $1 W

const newTotal = quantity * sellingPrice;
const newProfitPerUnit = sellingPrice - costPrice;
await client.query(
'UPDATE transactions SET quantity = $1, costPric
[quantity, costPrice, sellingPrice, newTotal, ne
);

await client.query('COMMIT');
res.json({ message: 'Transaksi berhasil diperbarui.'
} catch (err) {
await client.query('ROLLBACK');
res.status(400).json({ error: err.message });
} finally {
client.release();
}
});


// PRODUCTS API
app.post('/api/products', async (req, res) => {
const { name, stock, price, costPrice } = req.body;
try {
const result = await pool.query(
'INSERT INTO products (name, stock, price, costP
[name, stock, price, costPrice]
);
res.status(201).json({ id: result.rows[0].id });
} catch (err) {
res.status(400).json({ error: err.message });
}
});

app.get('/api/products', async (req, res) => {
const { search } = req.query;
let sql = `SELECT * FROM products`;
let params = [];
if (search) {
sql += ` WHERE name ILIKE $1`; // ILIKE for case-ins
params.push(`%${search}%`);
}
sql += ` ORDER BY name ASC`;
try {
const { rows } = await pool.query(sql, params);
res.json(rows);
} catch (err) {
res.status(400).json({ error: err.message });
}
});

app.put('/api/products/:id', async (req, res) => {
const { id } = req.params;
const { stock } = req.body;
try {
const result = await pool.query('UPDATE products SET
if (result.rowCount === 0) {
res.status(404).json({ error: 'Product not found
} else {
res.json({ message: 'Product stock updated succe
}
} catch (err) {
res.status(400).json({ error: err.message });
}
});

app.delete('/api/products/:id', async (req, res) => {
const { id } = req.params;
try {
const productRes = await pool.query('SELECT name FRO
if (productRes.rowCount === 0) {
return res.status(404).json({ error: 'Produk tid
}

const productName = productRes.rows[0].name;
const transactionCheck = await pool.query('SELECT 1

if (transactionCheck.rowCount > 0) {
return res.status(400).json({ error: 'Tidak dapa
}

const deleteRes = await pool.query('DELETE FROM prod
if (deleteRes.rowCount === 0) {
return res.status(404).json({ error: 'Gagal meng
}
res.json({ message: 'Produk berhasil dihapus.' });
} catch (err) {
res.status(500).json({ error: err.message });
}
});


// EXPENSES API
app.post('/api/expenses', async (req, res) => {
const { description, amount } = req.body;
const date = getLocalDate();
const client = await pool.connect();
try {
await client.query('BEGIN');
const expenseRes = await client.query(
'INSERT INTO expenses (description, amount, date
[description, amount, date]
);
await client.query(
'INSERT INTO capital_history (amount, date, type
[amount, date, 'subtract']
);
await client.query('COMMIT');
res.status(201).json({ id: expenseRes.rows[0].id });
} catch (err) {
await client.query('ROLLBACK');
res.status(400).json({ error: err.message });
} finally {
client.release();
}
});

app.get('/api/expenses', async (req, res) => {
const { startDate, endDate } = req.query;
let sql = `SELECT * FROM expenses`;
const params = [];
if (startDate && endDate) {
sql += ' WHERE date BETWEEN $1 AND $2';
params.push(startDate, endDate);
}
sql += ' ORDER BY date DESC, id DESC';
try {
const { rows } = await pool.query(sql, params);
res.json(rows);
} catch (err) {
res.status(400).json({ error: err.message });
}
});

app.put('/api/expenses/:id', async (req, res) => {
const { id } = req.params;
const { description, amount } = req.body;
const client = await pool.connect();
try {
await client.query('BEGIN');

const expenseRes = await client.query('SELECT * FROM
const originalExpense = expenseRes.rows[0];
if (!originalExpense) {
throw new Error('Expense not found.');
}

// Restore old capital amount
await client.query('INSERT INTO capital_history (amo
// Subtract new capital amount
await client.query('INSERT INTO capital_history (amo

await client.query('UPDATE expenses SET description

await client.query('COMMIT');
res.json({ message: 'Expense updated successfully.'
} catch (err) {
await client.query('ROLLBACK');
res.status(400).json({ error: err.message });
} finally {
client.release();
}
});

app.delete('/api/expenses/:id', async (req, res) => {
const { id } = req.params;
const client = await pool.connect();
try {
await client.query('BEGIN');

const expenseRes = await client.query('SELECT * FROM
const expense = expenseRes.rows[0];
if (!expense) {
throw new Error('Expense not found.');
}

await client.query('INSERT INTO capital_history (amo

const deleteRes = await client.query('DELETE FROM ex
if (deleteRes.rowCount === 0) {
throw new Error('Failed to delete expense.');
}

await client.query('COMMIT');
res.json({ message: 'Expense deleted successfully an
} catch (err) {
await client.query('ROLLBACK');
res.status(400).json({ error: err.message });
} finally {
client.release();
}
});


// CAPITAL API
app.post('/api/capital', async (req, res) => {
const { amount, type } = req.body;
const date = getLocalDate();
try {
const result = await pool.query(
'INSERT INTO capital_history (amount, date, type
[amount, date, type]
);
res.status(201).json({ id: result.rows[0].id });
} catch (err) {
res.status(400).json({ error: err.message });
}
});

app.get('/api/capital/total', async (req, res) => {
try {
const { rows } = await pool.query(`SELECT SUM(CASE W
const totalCapital = rows[0].totalcapital || 0;
res.json({ totalCapital });
} catch (err) {
res.status(400).json({ error: err.message });
}
});


// Start the server and initialize database
app.listen(port, () => {
console.log(`Server running on port ${port}`);
initializeDatabase();
});
