// File: backend/src/controllers/output.controller.js
// Output workflow: sell and rent with transactions; end rental

const db = require('../db');
const { validateCustomer } = require('../utils/validate');

async function ensureCustomer(conn, payload) {
  if (payload.customer_id) {
    const [rows] = await conn.execute('SELECT id FROM customers WHERE id = ?', [payload.customer_id]);
    if (rows.length === 0) throw new Error('Customer not found');
    return payload.customer_id;
  }
  const cp = payload.customer_payload;
  if (!cp || !cp.name || String(cp.name).trim() === '') throw new Error('customer_id or customer_payload.name is required');
  const [result] = await conn.execute(
    `INSERT INTO customers (name, phone, email, platform, app_id, preferred_language, customer_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      String(cp.name).trim(),
      cp.phone ? String(cp.phone).trim() : null,
      cp.email ? String(cp.email).trim() : null,
      cp.platform ? String(cp.platform).trim() : null,
      cp.app_id != null && cp.app_id !== '' ? String(cp.app_id).trim() : null,
      cp.preferred_language || 'jp',
      cp.customer_type || 'both'
    ]
  );
  return result.insertId;
}

async function sell(req, res, next) {
  const conn = await db.getConnection();
  try {
    const { item_id, sale_price, sale_date, platform_sold, notes, exact_location } = req.body;
    if (!item_id || sale_price == null || !sale_date) {
      return res.status(400).json({ error: 'item_id, sale_price, and sale_date are required' });
    }
    await conn.beginTransaction();
    const customer_id = await ensureCustomer(conn, req.body);
    const [itemRows] = await conn.execute(
      "SELECT id, status FROM items WHERE id = ? AND status IN ('in_stock', 'listed', 'reserved')",
      [item_id]
    );
    if (itemRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Item not found or not available for sale' });
    }
    const saleDateOnly = sale_date ? String(sale_date).trim().slice(0, 10) : sale_date;
    const [ins] = await conn.execute(
      `INSERT INTO sales (item_id, customer_id, sale_price, sale_date, platform_sold, notes, exact_location) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item_id, customer_id, Number(sale_price), saleDateOnly, (platform_sold && String(platform_sold).trim()) || null, (notes && String(notes).trim()) || null, (exact_location && String(exact_location).trim()) || null]
    );
    await conn.execute("UPDATE items SET status = 'sold' WHERE id = ?", [item_id]);
    await conn.commit();
    const [rows] = await db.execute(
      `SELECT s.*, i.title AS item_title, c.name AS customer_name FROM sales s
       JOIN items i ON s.item_id = i.id JOIN customers c ON s.customer_id = c.id WHERE s.id = ?`,
      [ins.insertId]
    );
    conn.release();
    res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback().catch(() => {});
    conn.release();
    next(err);
  }
}

async function rent(req, res, next) {
  const conn = await db.getConnection();
  try {
    const { item_id, rent_price_monthly, deposit, start_date, expected_end_date, notes, exact_location } = req.body;
    if (!item_id || rent_price_monthly == null || !start_date) {
      return res.status(400).json({ error: 'item_id, rent_price_monthly, and start_date are required' });
    }
    await conn.beginTransaction();
    const customer_id = await ensureCustomer(conn, req.body);
    const [itemRows] = await conn.execute(
      "SELECT id, status FROM items WHERE id = ? AND status IN ('in_stock', 'listed', 'reserved')",
      [item_id]
    );
    if (itemRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Item not found or not available for rent' });
    }
    const startDateOnly = start_date ? String(start_date).trim().slice(0, 10) : start_date;
    const expectedEndOnly = expected_end_date && String(expected_end_date).trim() !== '' ? String(expected_end_date).trim().slice(0, 10) : null;
    const [ins] = await conn.execute(
      `INSERT INTO rentals (item_id, customer_id, rent_price_monthly, deposit, start_date, expected_end_date, status, notes, exact_location)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        item_id, customer_id, Number(rent_price_monthly),
        deposit != null && deposit !== '' ? Number(deposit) : null,
        startDateOnly,
        expectedEndOnly,
        (notes && String(notes).trim()) || null,
        (exact_location && String(exact_location).trim()) || null
      ]
    );
    await conn.execute("UPDATE items SET status = 'rented' WHERE id = ?", [item_id]);
    await conn.commit();
    const [rows] = await db.execute(
      `SELECT r.*, i.title AS item_title, c.name AS customer_name FROM rentals r
       JOIN items i ON r.item_id = i.id JOIN customers c ON r.customer_id = c.id WHERE r.id = ?`,
      [ins.insertId]
    );
    conn.release();
    res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback().catch(() => {});
    conn.release();
    next(err);
  }
}

async function endRental(req, res, next) {
  const conn = await db.getConnection();
  try {
    const { end_date, item_next_status, damage_fee } = req.body;
    const rentalId = req.params.id;
    if (!end_date) {
      return res.status(400).json({ error: 'end_date is required' });
    }
    const nextStatus = (item_next_status && ['in_stock', 'listed'].includes(item_next_status)) ? item_next_status : 'in_stock';
    await conn.beginTransaction();
    const [existing] = await conn.execute('SELECT id, item_id, status FROM rentals WHERE id = ?', [rentalId]);
    if (existing.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Rental not found' });
    }
    if (existing[0].status === 'ended') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Rental is already ended' });
    }
    const itemId = existing[0].item_id;
    const endDateOnly = end_date ? String(end_date).trim().slice(0, 10) : end_date;
    await conn.execute(
      'UPDATE rentals SET end_date = ?, status = ?, damage_fee = COALESCE(?, damage_fee) WHERE id = ?',
      [endDateOnly, 'ended', damage_fee != null && damage_fee !== '' ? Number(damage_fee) : null, rentalId]
    );
    await conn.execute('UPDATE items SET status = ? WHERE id = ?', [nextStatus, itemId]);
    await conn.commit();
    const [rows] = await db.execute(
      `SELECT r.*, i.title AS item_title, c.name AS customer_name FROM rentals r
       JOIN items i ON r.item_id = i.id JOIN customers c ON r.customer_id = c.id WHERE r.id = ?`,
      [rentalId]
    );
    conn.release();
    res.json(rows[0]);
  } catch (err) {
    await conn.rollback().catch(() => {});
    conn.release();
    next(err);
  }
}

module.exports = { sell, rent, endRental };
