// File: backend/src/utils/validate.js
// Input validation helpers

const ITEM_STATUSES = ['in_stock', 'listed', 'rented', 'sold', 'reserved', 'disposed'];
const ITEM_CONDITIONS = ['new', 'good', 'fair', 'poor'];
const ACQUISITION_TYPES = ['free', 'cheap', 'bought'];
const LANGUAGES = ['jp', 'en', 'cn'];
const CUSTOMER_TYPES = ['buyer', 'renter', 'both'];
const RENTAL_STATUSES = ['active', 'ended', 'overdue'];

function required(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
}

function oneOf(value, options, fieldName) {
  if (value === undefined || value === null) return null;
  if (!options.includes(value)) {
    return `${fieldName} must be one of: ${options.join(', ')}`;
  }
  return null;
}

function number(value, fieldName, min = null, max = null) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return `${fieldName} must be a number`;
  if (min !== null && n < min) return `${fieldName} must be >= ${min}`;
  if (max !== null && n > max) return `${fieldName} must be <= ${max}`;
  return null;
}

function date(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${fieldName} must be a valid date`;
  return null;
}

/** Normalize date or datetime string to MySQL DATETIME format 'YYYY-MM-DD HH:mm:ss'. */
function toDatetime(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const s = String(value).trim();
  if (s.indexOf('T') !== -1) {
    const [datePart, timePart] = s.split('T');
    const time = (timePart || '00:00').substring(0, 5);
    const [h, m] = time.split(':');
    return `${datePart} ${h || '00'}:${m || '00'}:00`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s} 00:00:00`;
  if (/^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}/.test(s)) {
    const base = s.substring(0, 16);
    return s.length >= 19 && /:\d{2}$/.test(s) ? s.substring(0, 19) : base + ':00';
  }
  return null;
}

function validateItem(body, isUpdate = false) {
  let err = required(body.title, 'title');
  if (err) return err;
  if (body.sub_category_id != null && (err = number(body.sub_category_id, 'sub_category_id', 1))) return err;
  if (body.sub_category_id == null && !isUpdate) return 'sub_category_id is required';
  if (body.acquisition_type && (err = oneOf(body.acquisition_type, ACQUISITION_TYPES, 'acquisition_type'))) return err;
  if (body.condition && (err = oneOf(body.condition, ITEM_CONDITIONS, 'condition'))) return err;
  if (body.status && (err = oneOf(body.status, ITEM_STATUSES, 'status'))) return err;
  if (body.acquisition_cost != null && (err = number(body.acquisition_cost, 'acquisition_cost', 0))) return err;
  if (body.original_price != null && (err = number(body.original_price, 'original_price', 0))) return err;
  return null;
}

function validateCustomer(body, isUpdate = false) {
  let err = required(body.name, 'name');
  if (err) return err;
  if (body.preferred_language && (err = oneOf(body.preferred_language, LANGUAGES, 'preferred_language'))) return err;
  if (body.customer_type && (err = oneOf(body.customer_type, CUSTOMER_TYPES, 'customer_type'))) return err;
  return null;
}

function validateRental(body, isUpdate = false) {
  let err = required(body.item_id, 'item_id') || required(body.customer_id, 'customer_id') || required(body.rent_price_monthly, 'rent_price_monthly') || required(body.start_date, 'start_date');
  if (err) return err;
  if (err = number(body.item_id, 'item_id', 1)) return err;
  if (err = number(body.customer_id, 'customer_id', 1)) return err;
  if (err = number(body.rent_price_monthly, 'rent_price_monthly', 0)) return err;
  if (body.deposit != null && (err = number(body.deposit, 'deposit', 0))) return err;
  if (err = date(body.start_date, 'start_date')) return err;
  if (body.end_date != null && body.end_date !== '' && (err = date(body.end_date, 'end_date'))) return err;
  if (body.status && (err = oneOf(body.status, RENTAL_STATUSES, 'status'))) return err;
  if (body.damage_fee != null && (err = number(body.damage_fee, 'damage_fee', 0))) return err;
  return null;
}

function validateSale(body) {
  let err = required(body.item_id, 'item_id') || required(body.customer_id, 'customer_id') || required(body.sale_price, 'sale_price') || required(body.sale_date, 'sale_date');
  if (err) return err;
  if (err = number(body.item_id, 'item_id', 1)) return err;
  if (err = number(body.customer_id, 'customer_id', 1)) return err;
  if (err = number(body.sale_price, 'sale_price', 0)) return err;
  if (err = date(body.sale_date, 'sale_date')) return err;
  return null;
}

module.exports = {
  required,
  oneOf,
  number,
  date,
  validateItem,
  validateCustomer,
  validateRental,
  validateSale,
  ITEM_STATUSES,
  ITEM_CONDITIONS,
  ACQUISITION_TYPES,
  LANGUAGES,
  CUSTOMER_TYPES,
  RENTAL_STATUSES,
};
