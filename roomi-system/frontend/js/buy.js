// File: frontend/js/buy.js
// Buy / Acquire Stock page: form-first entry, recently acquired list

(function () {
  const form = document.getElementById('acquire-form');
  const alertEl = document.getElementById('alert');
  const listEl = document.getElementById('recently-acquired');
  const toastContainer = document.getElementById('toast-container');

  function showAlert(msg, type) {
    alertEl.textContent = msg;
    alertEl.className = 'alert alert-' + (type || 'info');
    alertEl.classList.remove('hidden');
  }
  function hideAlert() { alertEl.classList.add('hidden'); }

  function showToast(msg, type) {
    if (typeof t !== 'undefined' && msg === 'Item acquired and added to inventory.') msg = t('item_acquired');
    type = type || 'success';
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /** Format date for display: "9 Feb 2026" or "9 Feb 2026, 3:00 PM" if time present. */
  function formatAcquisitionDate(val) {
    if (val == null || val === '') return '—';
    var d = new Date(val);
    if (isNaN(d.getTime())) return escapeHtml(String(val));
    var dateStr = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear();
    var iso = String(val);
    if (iso.indexOf('T') !== -1) {
      dateStr += ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return dateStr;
  }

  // Default acquisition_date to today
  var dateInput = document.getElementById('acquisition_date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  // Main + Sub category: load main on init, load sub when main selected
  var mainCategorySelect = document.getElementById('main-category');
  var subCategorySelect = document.getElementById('sub-category');
  async function loadMainCategories() {
    if (!mainCategorySelect) return;
    try {
      var mains = await api.getMainCategories();
      mainCategorySelect.innerHTML = '<option value="" data-i18n="select_placeholder">— Select —</option>' +
        mains.map(function (m) { return '<option value="' + m.id + '">' + escapeHtml(m.name) + '</option>'; }).join('');
    } catch (e) {
      mainCategorySelect.innerHTML = '<option value="">Error loading categories</option>';
    }
  }
  async function loadSubCategories(mainId) {
    if (!subCategorySelect) return;
    subCategorySelect.innerHTML = '<option value="" data-i18n="select_placeholder">— Select —</option>';
    if (!mainId) return;
    try {
      var subs = await api.getSubCategories(mainId);
      subCategorySelect.innerHTML = '<option value="" data-i18n="select_placeholder">— Select —</option>' +
        subs.map(function (s) { return '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>'; }).join('');
    } catch (e) {
      subCategorySelect.innerHTML = '<option value="">Error loading sub categories</option>';
    }
  }
  if (mainCategorySelect) {
    mainCategorySelect.addEventListener('change', function () {
      loadSubCategories(this.value || null);
    });
  }
  loadMainCategories();

  // Exact location: optional, show/hide
  var toggleExactLoc = document.getElementById('toggle-exact-location');
  var exactLocationWrap = document.getElementById('exact-location-wrap');
  if (toggleExactLoc && exactLocationWrap) {
    toggleExactLoc.addEventListener('click', function (e) {
      e.preventDefault();
      if (exactLocationWrap.classList.contains('hidden')) {
        exactLocationWrap.classList.remove('hidden');
        toggleExactLoc.textContent = (typeof t !== 'undefined' ? (t('hide_exact_location') || '− Hide exact location') : '− Hide exact location');
      } else {
        exactLocationWrap.classList.add('hidden');
        if (document.getElementById('exact_location')) document.getElementById('exact_location').value = '';
        toggleExactLoc.textContent = (typeof t !== 'undefined' ? (t('add_exact_location') || '+ Add exact location (optional)') : '+ Add exact location (optional)');
      }
    });
  }

  // Source platform: show "Other" text field when "other" is selected
  var sourcePlatformSelect = document.getElementById('source_platform');
  var sourcePlatformOther = document.getElementById('source_platform_other');
  if (sourcePlatformSelect && sourcePlatformOther) {
    sourcePlatformSelect.addEventListener('change', function () {
      if (this.value === 'other') {
        sourcePlatformOther.classList.remove('hidden');
        sourcePlatformOther.focus();
      } else {
        sourcePlatformOther.classList.add('hidden');
        sourcePlatformOther.value = '';
      }
    });
  }

  // Acquisition type "free" → lock acquisition cost to 0
  var acquisitionTypeSelect = document.getElementById('acquisition_type');
  var acquisitionCostInput = document.getElementById('acquisition_cost');
  function toggleAcquisitionCost() {
    if (!acquisitionCostInput) return;
    if (acquisitionTypeSelect && acquisitionTypeSelect.value === 'free') {
      acquisitionCostInput.value = '0';
      acquisitionCostInput.disabled = true;
    } else {
      acquisitionCostInput.disabled = false;
    }
  }
  if (acquisitionTypeSelect) acquisitionTypeSelect.addEventListener('change', toggleAcquisitionCost);
  toggleAcquisitionCost();

  function getSourcePlatformValue() {
    var sel = document.getElementById('source_platform');
    var other = document.getElementById('source_platform_other');
    if (!sel) return null;
    if (sel.value === 'other' && other) return (other.value && other.value.trim()) ? other.value.trim() : null;
    return sel.value && sel.value.trim() ? sel.value.trim() : null;
  }

  async function loadRecentlyAcquired() {
    try {
      listEl.innerHTML = '<p class="loading">' + (typeof t !== 'undefined' ? t('loading') : 'Loading…') + '</p>';
      var items = await api.getRecentlyAcquiredItems();
      if (items.length === 0) {
        listEl.innerHTML = '<p class="empty-state">' + (typeof t !== 'undefined' ? t('no_acquisitions') : 'No acquisitions yet. Add one above.') + '</p>';
        return;
      }
      var T = typeof t !== 'undefined' ? t : function(k){ return k; };
      listEl.innerHTML = '<div class="item-list">' + items.map(function (i) {
        var platform = escapeHtml(i.source_platform || '—');
        var date = formatAcquisitionDate(i.acquisition_date);
        return '<a href="items.html?id=' + i.id + '" class="item-list-item">' +
          '<span class="item-list-item-title">' + escapeHtml(i.title) + '</span>' +
          '<span class="item-list-item-meta">' +
            '<span class="item-list-item-category">' + escapeHtml((i.main_category_name && i.sub_category_name) ? (i.main_category_name + ' → ' + i.sub_category_name) : (i.sub_category_name || i.category || '—')) + '</span>' +
            '<span class="item-list-item-date">' + date + '</span>' +
            '<span class="item-list-item-platform">' + platform + '</span>' +
            '<span class="badge badge-' + i.status + '">' + i.status + '</span>' +
          '</span></a>';
      }).join('') + '</div>';
    } catch (e) {
      listEl.innerHTML = '<p class="empty-state">Error: ' + escapeHtml(e.message) + '</p>';
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    var subIdEl = document.getElementById('sub-category');
    var subId = subIdEl && subIdEl.value ? parseInt(subIdEl.value, 10) : null;
    if (!subId) {
      showAlert(typeof t !== 'undefined' ? t('sub_category_required') : 'Please select a sub category.', 'error');
      return;
    }
    var body = {
      title: document.getElementById('title').value.trim(),
      sub_category_id: subId,
      source_platform: getSourcePlatformValue(),
      acquisition_type: document.getElementById('acquisition_type').value,
      acquisition_cost: document.getElementById('acquisition_type').value === 'free' ? 0 : (parseFloat(document.getElementById('acquisition_cost').value) || 0),
      original_price: document.getElementById('original_price').value ? parseFloat(document.getElementById('original_price').value) : null,
      condition: document.getElementById('condition').value,
      location_area: null,
      exact_location: document.getElementById('exact_location') ? document.getElementById('exact_location').value.trim() || null : null,
      notes: document.getElementById('notes').value.trim() || null,
      status: 'in_stock',
      acquisition_date: document.getElementById('acquisition_date').value || null
    };
    try {
      await api.createItem(body);
      showToast(typeof t !== 'undefined' ? t('item_acquired') : 'Item acquired and added to inventory.');
      form.reset();
      document.getElementById('acquisition_date').value = new Date().toISOString().slice(0, 10);
      document.getElementById('acquisition_cost').value = '0';
      document.getElementById('condition').value = 'good';
      document.getElementById('acquisition_type').value = 'bought';
      document.getElementById('source_platform').value = '';
      if (sourcePlatformOther) { sourcePlatformOther.classList.add('hidden'); sourcePlatformOther.value = ''; }
      toggleAcquisitionCost();
      loadRecentlyAcquired();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  });

  loadRecentlyAcquired();
})();
