// File: backend/src/controllers/sales.controller.js

const db = require('../db');
const { validateSale } = require('../utils/validate');

async function getAll(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, i.title AS item_title, c.name AS customer_name, c.platform AS customer_platform
       FROM sales s JOIN items i ON s.item_id = i.id JOIN customers c ON s.customer_id = c.id
       ORDER BY s.sale_date DESC, s.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, i.title AS item_title, c.name AS customer_name, c.platform AS customer_platform
       FROM sales s JOIN items i ON s.item_id = i.id JOIN customers c ON s.customer_id = c.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Sale not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const err = validateSale(req.body);
    if (err) return res.status(400).json({ error: err });
    const { item_id, customer_id, sale_price, sale_date, platform_sold, notes, exact_location } = req.body;
    const saleDateOnly = sale_date ? String(sale_date).trim().slice(0, 10) : sale_date;
    const [itemRows] = await db.execute('SELECT id, status FROM items WHERE id = ?', [item_id]);
    if (itemRows.length === 0) return res.status(400).json({ error: 'Item not found' });
    const [custRows] = await db.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (custRows.length === 0) return res.status(400).json({ error: 'Customer not found' });
    const [result] = await db.execute(
      `INSERT INTO sales (item_id, customer_id, sale_price, sale_date, platform_sold, notes, exact_location) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item_id, customer_id, Number(sale_price), saleDateOnly, platform_sold?.trim() || null, notes?.trim() || null, exact_location?.trim() || null]
    );
    await db.execute("UPDATE items SET status = 'sold' WHERE id = ?", [item_id]);
    const [rows] = await db.execute(
      `SELECT s.*, i.title AS item_title, c.name AS customer_name FROM sales s
       JOIN items i ON s.item_id = i.id JOIN customers c ON s.customer_id = c.id WHERE s.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
