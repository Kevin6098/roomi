// File: backend/src/controllers/items.controller.js

const db = require('../db');
const { validateItem } = require('../utils/validate');

const EFFECTIVE_LOCATION_SQL = `CASE
  WHEN i.status = 'rented' THEN (SELECT r.exact_location FROM rentals r WHERE r.item_id = i.id AND r.status = 'active' ORDER BY r.id DESC LIMIT 1)
  WHEN i.status = 'sold' THEN (SELECT s.exact_location FROM sales s WHERE s.item_id = i.id ORDER BY s.id DESC LIMIT 1)
  ELSE i.exact_location
END AS effective_location`;

// Join to include main_category_name and sub_category_name in item results
const ITEM_JOIN_CATEGORIES = `FROM items i
  JOIN sub_categories sc ON sc.id = i.sub_category_id
  JOIN main_categories mc ON mc.id = sc.main_category_id`;

function isUnknownColumnError(err) {
  const msg = (err.message || '').toLowerCase();
  return err.code === 'ER_BAD_FIELD_ERROR' || msg.includes('unknown column');
}

async function getAll(req, res, next) {
  try {
    const { status, sub_category_id, search } = req.query;
    const params = [];
    let sql = `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name, ${EFFECTIVE_LOCATION_SQL} ${ITEM_JOIN_CATEGORIES} WHERE 1=1`;
    if (status) { sql += ' AND i.status = ?'; params.push(status); }
    if (sub_category_id) { sql += ' AND i.sub_category_id = ?'; params.push(sub_category_id); }
    if (search && search.trim()) { sql += ' AND i.title LIKE ?'; params.push(`%${search.trim()}%`); }
    sql += ' ORDER BY i.created_at DESC';
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name ${ITEM_JOIN_CATEGORIES} WHERE i.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const err = validateItem(req.body);
    if (err) return res.status(400).json({ error: err });
    const {
      title, sub_category_id, source_platform, acquisition_type, acquisition_cost,
      original_price, condition, location_area, exact_location, status, notes, acquisition_date
    } = req.body;
    const acqDate = acquisition_date && /^\d{4}-\d{2}-\d{2}$/.test(acquisition_date) ? acquisition_date : null;
    const subId = sub_category_id != null ? parseInt(sub_category_id, 10) : null;
    if (!subId || subId < 1) {
      return res.status(400).json({ error: 'sub_category_id is required' });
    }
    const [result] = await db.execute(
      `INSERT INTO items (title, sub_category_id, source_platform, acquisition_type, acquisition_cost, original_price, \`condition\`, location_area, exact_location, status, acquisition_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_DATE), ?)`,
      [
        title?.trim() || '',
        subId,
        source_platform?.trim() || null,
        acquisition_type || 'bought',
        acquisition_cost != null ? Number(acquisition_cost) : 0,
        original_price != null ? Number(original_price) : null,
        condition || 'good',
        location_area?.trim() || null,
        exact_location?.trim() || null,
        status || 'in_stock',
        acqDate,
        notes?.trim() || null
      ]
    );
    const [rows] = await db.execute(
      `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name ${ITEM_JOIN_CATEGORIES} WHERE i.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const err = validateItem(req.body, true);
    if (err) return res.status(400).json({ error: err });
    const [existing] = await db.execute('SELECT id FROM items WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Item not found' });
    const {
      title, sub_category_id, source_platform, acquisition_type, acquisition_cost,
      original_price, condition, location_area, exact_location, status, notes, acquisition_date
    } = req.body;
    const acqDate = acquisition_date && /^\d{4}-\d{2}-\d{2}$/.test(acquisition_date) ? acquisition_date : null;
    const subId = sub_category_id != null ? parseInt(sub_category_id, 10) : null;
    if (!subId || subId < 1) {
      return res.status(400).json({ error: 'sub_category_id is required' });
    }
    await db.execute(
      `UPDATE items SET title=?, sub_category_id=?, source_platform=?, acquisition_type=?, acquisition_cost=?, original_price=?, \`condition\`=?, location_area=?, exact_location=?, status=?, acquisition_date=COALESCE(?, acquisition_date), notes=? WHERE id=?`,
      [
        title?.trim(),
        subId,
        source_platform?.trim() || null,
        acquisition_type,
        acquisition_cost != null ? Number(acquisition_cost) : 0,
        original_price != null ? Number(original_price) : null,
        condition,
        location_area?.trim() || null,
        exact_location?.trim() || null,
        status,
        acqDate,
        notes?.trim() || null,
        req.params.id
      ]
    );
    const [rows] = await db.execute(
      `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name ${ITEM_JOIN_CATEGORIES} WHERE i.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const [existing] = await db.execute('SELECT id FROM items WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Item not found' });
    await db.execute("UPDATE items SET status = 'disposed' WHERE id = ?", [req.params.id]);
    const [rows] = await db.execute(
      `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name ${ITEM_JOIN_CATEGORIES} WHERE i.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getCounts(req, res, next) {
  try {
    const [rows] = await db.execute(
      'SELECT status, COUNT(*) as count FROM items GROUP BY status'
    );
    const counts = { in_stock: 0, listed: 0, rented: 0, sold: 0, reserved: 0, disposed: 0 };
    rows.forEach((r) => { counts[r.status] = r.count; });
    res.json(counts);
  } catch (err) {
    next(err);
  }
}

async function getRecent(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name, ${EFFECTIVE_LOCATION_SQL} ${ITEM_JOIN_CATEGORIES} ORDER BY i.created_at DESC LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getRecentlyAcquired(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name, ${EFFECTIVE_LOCATION_SQL} ${ITEM_JOIN_CATEGORIES} ORDER BY COALESCE(i.acquisition_date, i.created_at) DESC, i.created_at DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getAvailable(req, res, next) {
  try {
    const { search, sub_category_id } = req.query;
    let sql = `SELECT i.*, mc.id AS main_category_id, mc.name AS main_category_name, sc.name AS sub_category_name ${ITEM_JOIN_CATEGORIES} WHERE i.status IN ('in_stock', 'listed', 'reserved')`;
    const params = [];
    if (sub_category_id) { sql += ' AND i.sub_category_id = ?'; params.push(sub_category_id); }
    if (search && search.trim()) { sql += ' AND i.title LIKE ?'; params.push(`%${search.trim()}%`); }
    sql += ' ORDER BY i.title';
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, getCounts, getRecent, getRecentlyAcquired, getAvailable };
