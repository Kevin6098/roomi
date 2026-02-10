// File: backend/src/controllers/rentals.controller.js

const db = require('../db');
const { validateRental } = require('../utils/validate');

async function getAll(req, res, next) {
  try {
    const { status } = req.query;
    let sql = `SELECT r.*, i.title AS item_title, i.original_price AS item_original_price, c.name AS customer_name
               FROM rentals r
               JOIN items i ON r.item_id = i.id
               JOIN customers c ON r.customer_id = c.id
               WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND r.status = ?'; params.push(status); }
    sql += ' ORDER BY r.created_at DESC';
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT r.*, i.title AS item_title, i.original_price AS item_original_price, c.name AS customer_name
       FROM rentals r JOIN items i ON r.item_id = i.id JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Rental not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const err = validateRental(req.body);
    if (err) return res.status(400).json({ error: err });
    const { item_id, customer_id, rent_price_monthly, deposit, start_date, end_date, expected_end_date, notes, exact_location } = req.body;
    const startDateOnly = start_date ? String(start_date).trim().slice(0, 10) : start_date;
    const endDateOnly = end_date ? String(end_date).trim().slice(0, 10) : null;
    const expectedEndOnly = expected_end_date && expected_end_date !== '' ? String(expected_end_date).trim().slice(0, 10) : null;
    const [itemRows] = await db.execute('SELECT id, status FROM items WHERE id = ?', [item_id]);
    if (itemRows.length === 0) return res.status(400).json({ error: 'Item not found' });
    if (itemRows[0].status !== 'in_stock' && itemRows[0].status !== 'listed' && itemRows[0].status !== 'reserved') {
      return res.status(400).json({ error: 'Item is not available for rent' });
    }
    const [custRows] = await db.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (custRows.length === 0) return res.status(400).json({ error: 'Customer not found' });
    const [result] = await db.execute(
      `INSERT INTO rentals (item_id, customer_id, rent_price_monthly, deposit, start_date, end_date, expected_end_date, status, notes, exact_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [item_id, customer_id, Number(rent_price_monthly), deposit != null && deposit !== '' ? Number(deposit) : null, startDateOnly, endDateOnly, expectedEndOnly, notes?.trim() || null, exact_location?.trim() || null]
    );
    await db.execute("UPDATE items SET status = 'rented' WHERE id = ?", [item_id]);
    const [rows] = await db.execute(
      `SELECT r.*, i.title AS item_title, c.name AS customer_name FROM rentals r
       JOIN items i ON r.item_id = i.id JOIN customers c ON r.customer_id = c.id WHERE r.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const err = validateRental(req.body, true);
    if (err) return res.status(400).json({ error: err });
    const [existing] = await db.execute('SELECT * FROM rentals WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Rental not found' });
    const r = existing[0];
    const { end_date, status, damage_fee, notes } = req.body;
    const newStatus = status ?? r.status;
    const newEndDate = end_date !== undefined && end_date !== '' ? String(end_date).trim().slice(0, 10) : r.end_date;
    await db.execute(
      `UPDATE rentals SET end_date=?, status=?, damage_fee=?, notes=? WHERE id=?`,
      [newEndDate || null, newStatus, damage_fee != null && damage_fee !== '' ? Number(damage_fee) : null, notes?.trim() ?? r.notes, req.params.id]
    );
    if (newStatus === 'ended' && r.item_id) {
      await db.execute("UPDATE items SET status = 'in_stock' WHERE id = ?", [r.item_id]);
    }
    const [rows] = await db.execute(
      `SELECT r.*, i.title AS item_title, c.name AS customer_name FROM rentals r
       JOIN items i ON r.item_id = i.id JOIN customers c ON r.customer_id = c.id WHERE r.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function setDamage(req, res, next) {
  try {
    const [existing] = await db.execute('SELECT r.*, i.original_price FROM rentals r JOIN items i ON r.item_id = i.id WHERE r.id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Rental not found' });
    const damageFee = req.body.damage_fee != null ? Number(req.body.damage_fee) : (existing[0].original_price || 0);
    await db.execute('UPDATE rentals SET damage_fee = ? WHERE id = ?', [damageFee, req.params.id]);
    const [rows] = await db.execute(
      `SELECT r.*, i.title AS item_title, c.name AS customer_name FROM rentals r
       JOIN items i ON r.item_id = i.id JOIN customers c ON r.customer_id = c.id WHERE r.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, setDamage };
