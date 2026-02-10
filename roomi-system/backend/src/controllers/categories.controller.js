// File: backend/src/controllers/categories.controller.js
// Main + Sub category hierarchy

const db = require('../db');

/** GET /api/categories/main — return all main categories */
async function getMain(req, res, next) {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, created_at FROM main_categories ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** GET /api/categories/sub/:mainId — return sub categories under main */
async function getSubByMainId(req, res, next) {
  try {
    const mainId = parseInt(req.params.mainId, 10);
    if (Number.isNaN(mainId)) {
      return res.status(400).json({ error: 'Invalid main category id' });
    }
    const [rows] = await db.execute(
      'SELECT id, main_category_id, name, created_at FROM sub_categories WHERE main_category_id = ? ORDER BY name',
      [mainId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** POST /api/categories/main — create main category */
async function createMain(req, res, next) {
  try {
    const name = req.body.name && String(req.body.name).trim();
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const [result] = await db.execute(
      'INSERT INTO main_categories (name) VALUES (?)',
      [name]
    );
    const [rows] = await db.execute('SELECT id, name, created_at FROM main_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Main category name already exists' });
    }
    next(err);
  }
}

/** POST /api/categories/sub — create sub category */
async function createSub(req, res, next) {
  try {
    const main_category_id = req.body.main_category_id != null ? parseInt(req.body.main_category_id, 10) : NaN;
    const name = req.body.name && String(req.body.name).trim();
    if (Number.isNaN(main_category_id) || main_category_id < 1) {
      return res.status(400).json({ error: 'main_category_id is required and must be a positive integer' });
    }
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const [result] = await db.execute(
      'INSERT INTO sub_categories (main_category_id, name) VALUES (?, ?)',
      [main_category_id, name]
    );
    const [rows] = await db.execute(
      'SELECT id, main_category_id, name, created_at FROM sub_categories WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ error: 'Main category not found' });
    }
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Sub category name already exists under this main category' });
    }
    next(err);
  }
}

module.exports = { getMain, getSubByMainId, createMain, createSub };
