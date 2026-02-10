// File: backend/src/controllers/customers.controller.js

const db = require('../db');
const { validateCustomer } = require('../utils/validate');

async function getAll(req, res, next) {
  try {
    const [rows] = await db.execute('SELECT * FROM customers ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await db.execute('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const err = validateCustomer(req.body);
    if (err) return res.status(400).json({ error: err });
    const { name, phone, email, platform, app_id, preferred_language, customer_type } = req.body;
    const [result] = await db.execute(
      `INSERT INTO customers (name, phone, email, platform, app_id, preferred_language, customer_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name?.trim() || '',
        phone?.trim() || null,
        email?.trim() || null,
        platform?.trim() || null,
        app_id != null && app_id !== '' ? String(app_id).trim() : null,
        preferred_language || 'jp',
        customer_type || 'both'
      ]
    );
    const [rows] = await db.execute('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const err = validateCustomer(req.body, true);
    if (err) return res.status(400).json({ error: err });
    const [existing] = await db.execute('SELECT id FROM customers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Customer not found' });
    const { name, phone, email, platform, app_id, preferred_language, customer_type } = req.body;
    await db.execute(
      `UPDATE customers SET name=?, phone=?, email=?, platform=?, app_id=?, preferred_language=?, customer_type=? WHERE id=?`,
      [name?.trim(), phone?.trim() || null, email?.trim() || null, platform?.trim() || null, app_id != null && app_id !== '' ? String(app_id).trim() : null, preferred_language || 'jp', customer_type || 'both', req.params.id]
    );
    const [rows] = await db.execute('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const [existing] = await db.execute('SELECT id FROM customers WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Customer not found' });
    await db.execute('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Customer has rentals or sales; cannot delete' });
    }
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
