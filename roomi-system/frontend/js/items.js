// File: frontend/js/items.js

(function () {
  const alertEl = document.getElementById('alert');
  const listEl = document.getElementById('items-list');
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('item-form');
  const modalTitle = document.getElementById('modal-title');
  const statuses = ['in_stock', 'listed', 'rented', 'sold', 'reserved', 'disposed'];

  function showAlert(msg, type) {
    alertEl.textContent = msg;
    alertEl.className = 'alert alert-' + (type || 'info');
    alertEl.classList.remove('hidden');
  }
  function hideAlert() { alertEl.classList.add('hidden'); }

  function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function getFilters() {
    var subEl = document.getElementById('filter-sub-category');
    return {
      status: document.getElementById('filter-status').value || undefined,
      sub_category_id: subEl && subEl.value ? subEl.value : undefined,
      search: document.getElementById('filter-search').value.trim() || undefined
    };
  }

  async function loadItems() {
    try {
      listEl.innerHTML = '<p class="loading">' + (typeof t !== 'undefined' ? t('loading') : 'Loading…') + '</p>';
      const params = getFilters();
      const items = await api.getItems(params);
      if (items.length === 0) {
        listEl.innerHTML = '<p class="empty-state">' + (typeof t !== 'undefined' ? t('no_items_match') : 'No items match the filters.') + '</p>';
        return;
      }
      var T = typeof t !== 'undefined' ? t : function(k){ return k; };
      var statusLabels = { in_stock: T('status_in_stock'), listed: T('status_listed'), rented: T('status_rented'), sold: T('status_sold'), reserved: T('status_reserved'), disposed: T('status_disposed') };
      listEl.innerHTML = '<div class="table-wrap"><table><thead><tr><th>' + T('id') + '</th><th>' + T('title') + '</th><th>' + T('category') + '</th><th>' + T('condition') + '</th><th>' + T('location') + '</th><th>' + T('status') + '</th><th>' + T('actions_label') + '</th></tr></thead><tbody>' +
        items.map(function (i) {
          var statusOpts = statuses.map(function (s) {
            return '<option value="' + s + '"' + (i.status === s ? ' selected' : '') + '>' + statusLabels[s] + '</option>';
          }).join('');
          var actions = '<div class="item-actions">' +
            '<button type="button" class="btn btn-sm btn-primary btn-edit" data-id="' + i.id + '">' + T('edit') + '</button>' +
            '<select class="item-status-select" data-id="' + i.id + '" data-current="' + i.status + '" title="' + (typeof t !== 'undefined' ? t('status') : 'Status') + '">' + statusOpts + '</select>' +
            '<button type="button" class="btn btn-sm btn-danger btn-delete" data-id="' + i.id + '">' + T('delete') + '</button></div>';
          var loc = (i.effective_location != null && i.effective_location !== '') ? i.effective_location : (typeof t !== 'undefined' ? t('undecided_yet') : 'Undecided yet');
          var titleLink = '<a href="items.html?id=' + i.id + '" class="table-link">' + escapeHtml(i.title) + '</a>';
          var catDisplay = (i.main_category_name && i.sub_category_name) ? (i.main_category_name + ' → ' + i.sub_category_name) : (i.sub_category_name || escapeHtml(i.category) || '—');
          return '<tr><td><a href="items.html?id=' + i.id + '" class="table-link">' + i.id + '</a></td><td>' + titleLink + '</td><td>' + escapeHtml(catDisplay) + '</td><td>' + escapeHtml(i.condition) + '</td><td>' + escapeHtml(loc) + '</td><td><span class="badge badge-' + i.status + '">' + statusLabels[i.status] + '</span></td><td>' + actions + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      listEl.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () { openEdit(parseInt(btn.dataset.id, 10)); });
      });
      listEl.querySelectorAll('.item-status-select').forEach(function (sel) {
        sel.addEventListener('change', function () {
          var id = parseInt(sel.dataset.id, 10);
          var newStatus = sel.value;
          var current = sel.dataset.current;
          if (newStatus === current) return;
          if (newStatus === 'reserved') {
            setStatus(id, newStatus);
            sel.value = current;
            return;
          }
          setStatus(id, newStatus);
        });
      });
      listEl.querySelectorAll('.btn-delete').forEach(function (btn) {
        btn.addEventListener('click', function () { deleteItem(parseInt(btn.dataset.id, 10)); });
      });
    } catch (e) {
      listEl.innerHTML = '<p class="empty-state">' + (typeof t !== 'undefined' ? t('error_prefix') : 'Error: ') + escapeHtml(e.message) + '</p>';
      showAlert(e.message, 'error');
    }
  }

  var knownSourcePlatforms = ['rednote', 'facebook', 'friends', 'mercari', 'jimoty', 'yahoo_auctions'];

  function toggleItemSourcePlatformOther() {
    var sel = document.getElementById('item-source_platform');
    var other = document.getElementById('item-source_platform_other');
    if (!sel || !other) return;
    if (sel.value === 'other') { other.classList.remove('hidden'); other.focus(); } else { other.classList.add('hidden'); other.value = ''; }
  }

  function getItemSourcePlatformValue() {
    var sel = document.getElementById('item-source_platform');
    var other = document.getElementById('item-source_platform_other');
    if (!sel) return null;
    if (sel.value === 'other' && other) return (other.value && other.value.trim()) ? other.value.trim() : null;
    return sel.value && sel.value.trim() ? sel.value.trim() : null;
  }

  function toggleItemAcquisitionCost() {
    var typeSel = document.getElementById('item-acquisition_type');
    var costInput = document.getElementById('item-acquisition_cost');
    if (!costInput) return;
    if (typeSel && typeSel.value === 'free') {
      costInput.value = '0';
      costInput.disabled = true;
    } else {
      costInput.disabled = false;
    }
  }

  function openAdd() {
    document.getElementById('item-id').value = '';
    form.reset();
    document.getElementById('item-status').value = 'in_stock';
    document.getElementById('item-acquisition_type').value = 'bought';
    document.getElementById('item-condition').value = 'good';
    document.getElementById('item-acquisition_cost').value = '0';
    document.getElementById('item-source_platform').value = '';
    var other = document.getElementById('item-source_platform_other');
    if (other) { other.classList.add('hidden'); other.value = ''; }
    var subSel = document.getElementById('item-sub-category');
    if (subSel) subSel.innerHTML = '<option value="" data-i18n="select_sub_first">— Select main first —</option>';
    toggleItemAcquisitionCost();
    var exactWrap = document.getElementById('item-exact-location-wrap');
    var exactInput = document.getElementById('item-exact_location');
    var exactLink = document.getElementById('item-toggle-exact-location');
    if (exactWrap) exactWrap.classList.add('hidden');
    if (exactInput) exactInput.value = '';
    if (exactLink) exactLink.textContent = (typeof t !== 'undefined' ? (t('add_exact_location') || '+ Add exact location (optional)') : '+ Add exact location (optional)');
    modalTitle.textContent = (typeof t !== 'undefined' ? t('add_item') : 'Add item');
    overlay.classList.remove('hidden');
  }

  async function openEdit(id) {
    try {
      const item = await api.getItem(id);
      document.getElementById('item-id').value = item.id;
      document.getElementById('item-title').value = item.title || '';
      var mainSel = document.getElementById('item-main-category');
      var subSel = document.getElementById('item-sub-category');
      if (mainSel && item.main_category_id) {
        mainSel.value = item.main_category_id;
        if (subSel) {
          var subs = await api.getSubCategories(item.main_category_id);
          subSel.innerHTML = '<option value="" data-i18n="select_placeholder">— Select —</option>' +
            subs.map(function (s) { return '<option value="' + s.id + '"' + (s.id === item.sub_category_id ? ' selected' : '') + '>' + escapeHtml(s.name) + '</option>'; }).join('');
        }
      } else if (subSel) {
        subSel.innerHTML = '<option value="" data-i18n="select_sub_first">— Select main first —</option>';
      }
      document.getElementById('item-condition').value = item.condition || 'good';
      var sp = (item.source_platform || '').trim();
      var spSelect = document.getElementById('item-source_platform');
      var spOther = document.getElementById('item-source_platform_other');
      if (sp && knownSourcePlatforms.indexOf(sp) !== -1) {
        spSelect.value = sp;
        if (spOther) { spOther.classList.add('hidden'); spOther.value = ''; }
      } else {
        spSelect.value = sp ? 'other' : '';
        if (spOther) { spOther.value = sp; spOther.classList.remove('hidden'); }
      }
      document.getElementById('item-acquisition_type').value = item.acquisition_type || 'bought';
      document.getElementById('item-acquisition_cost').value = item.acquisition_cost != null ? item.acquisition_cost : '';
      toggleItemAcquisitionCost();
      document.getElementById('item-original_price').value = item.original_price != null ? item.original_price : '';
      var exactLoc = (item.exact_location || '').trim();
      var exactWrap = document.getElementById('item-exact-location-wrap');
      var exactInput = document.getElementById('item-exact_location');
      var exactLink = document.getElementById('item-toggle-exact-location');
      if (exactInput) exactInput.value = exactLoc;
      if (exactLoc && exactWrap) { exactWrap.classList.remove('hidden'); if (exactLink) exactLink.textContent = (typeof t !== 'undefined' ? (t('hide_exact_location') || '− Hide exact location') : '− Hide exact location'); }
      else { if (exactWrap) exactWrap.classList.add('hidden'); if (exactLink) exactLink.textContent = (typeof t !== 'undefined' ? (t('add_exact_location') || '+ Add exact location (optional)') : '+ Add exact location (optional)'); }
      document.getElementById('item-status').value = item.status || 'in_stock';
      document.getElementById('item-notes').value = item.notes || '';
      modalTitle.textContent = (typeof t !== 'undefined' ? t('edit_item') : 'Edit item');
      overlay.classList.remove('hidden');
    } catch (e) {
      showAlert(e.message, 'error');
    }
  }

  function closeModal() {
    overlay.classList.add('hidden');
    hideAlert();
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    const id = document.getElementById('item-id').value;
    var subCatEl = document.getElementById('item-sub-category');
    var subCategoryId = subCatEl && subCatEl.value ? parseInt(subCatEl.value, 10) : null;
    if (!subCategoryId) {
      showAlert((typeof t !== 'undefined' ? t('sub_category_required') : 'Please select a sub category.'), 'error');
      return;
    }
    const body = {
      title: document.getElementById('item-title').value.trim(),
      sub_category_id: subCategoryId,
      source_platform: getItemSourcePlatformValue(),
      acquisition_type: document.getElementById('item-acquisition_type').value,
      acquisition_cost: document.getElementById('item-acquisition_type').value === 'free' ? 0 : (parseFloat(document.getElementById('item-acquisition_cost').value) || 0),
      original_price: document.getElementById('item-original_price').value ? parseFloat(document.getElementById('item-original_price').value) : null,
      condition: document.getElementById('item-condition').value,
      location_area: null,
      exact_location: document.getElementById('item-exact_location') ? document.getElementById('item-exact_location').value.trim() || null : null,
      status: document.getElementById('item-status').value,
      notes: document.getElementById('item-notes').value.trim() || null
    };
    try {
      if (id) {
        await api.updateItem(id, body);
        showAlert((typeof t !== 'undefined' ? t('item_updated') : 'Item updated.'), 'success');
      } else {
        await api.createItem(body);
        showAlert((typeof t !== 'undefined' ? t('item_added') : 'Item added.'), 'success');
      }
      closeModal();
      loadItems();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  });

  function setStatus(id, status) {
    // Rent / Sell: go to Output page to record the transaction
    if (status === 'rented') {
      window.location.href = 'output.html?item_id=' + encodeURIComponent(id) + '#rent';
      return;
    }
    if (status === 'sold') {
      window.location.href = 'output.html?item_id=' + encodeURIComponent(id) + '#sell';
      return;
    }
    if (status === 'reserved') {
      openReserveModal(id);
      return;
    }
    // in_stock, listed, disposed: update directly
    updateStatusDirect(id, status);
  }

  async function updateStatusDirect(id, status) {
    try {
      const item = await api.getItem(id);
      await api.updateItem(id, { ...item, status: status });
      showAlert((typeof t !== 'undefined' ? t('status_updated') : 'Status updated to') + ' ' + status, 'success');
      loadItems();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  }

  var reserveModal = document.getElementById('reserve-modal');
  var reserveItemId = null;

  async function openReserveModal(itemId) {
    reserveItemId = itemId;
    var sel = document.getElementById('reserve-customer_id');
    try {
      var customers = await api.getCustomers();
      var T = typeof t !== 'undefined' ? t : function (k) { return k; };
      sel.innerHTML = '<option value="">' + T('select_customer_short') + '</option>' + customers.map(function (c) {
        return '<option value="' + c.id + '">' + escapeHtml(c.name) + ' (#' + c.id + ')</option>';
      }).join('');
    } catch (e) {
      showAlert(e.message, 'error');
      return;
    }
    document.getElementById('reserve-notes').value = '';
    reserveModal.classList.remove('hidden');
  }

  function closeReserveModal() {
    reserveModal.classList.add('hidden');
    reserveItemId = null;
  }

  async function saveReserve() {
    if (!reserveItemId) return;
    var customerId = document.getElementById('reserve-customer_id').value;
    var notes = document.getElementById('reserve-notes').value.trim();
    if (!customerId) {
      showAlert((typeof t !== 'undefined' ? t('please_select_customer') : 'Please select a customer.'), 'error');
      return;
    }
    try {
      var item = await api.getItem(reserveItemId);
      var customerName = document.getElementById('reserve-customer_id').selectedOptions[0] && document.getElementById('reserve-customer_id').selectedOptions[0].text;
      var reserveNote = 'Reserved for: ' + (customerName || '').replace(/\s*\(\#\d+\)\s*$/, '') + (notes ? '. ' + notes : '');
      var newNotes = (item.notes || '').trim() ? (item.notes + '\n' + reserveNote) : reserveNote;
      await api.updateItem(reserveItemId, { ...item, status: 'reserved', notes: newNotes });
      showAlert((typeof t !== 'undefined' ? t('item_reserved') : 'Item marked as reserved.'), 'success');
      closeReserveModal();
      loadItems();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  }

  async function deleteItem(id) {
    if (!confirm('Soft-delete this item (set to disposed)?')) return;
    try {
      await api.deleteItem(id);
      showAlert((typeof t !== 'undefined' ? t('item_deleted') : 'Item deleted (disposed).'), 'success');
      loadItems();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  }

  // Filter: main + sub category (load main on init, load sub when main selected)
  var filterMain = document.getElementById('filter-main-category');
  var filterSub = document.getElementById('filter-sub-category');
  async function loadFilterMainCategories() {
    if (!filterMain) return;
    try {
      var mains = await api.getMainCategories();
      filterMain.innerHTML = '<option value="" data-i18n="all">All</option>' +
        mains.map(function (m) { return '<option value="' + m.id + '">' + escapeHtml(m.name) + '</option>'; }).join('');
    } catch (e) {
      filterMain.innerHTML = '<option value="">Error</option>';
    }
  }
  async function loadFilterSubCategories(mainId) {
    if (!filterSub) return;
    filterSub.innerHTML = '<option value="" data-i18n="all">All</option>';
    if (!mainId) return;
    try {
      var subs = await api.getSubCategories(mainId);
      filterSub.innerHTML = '<option value="" data-i18n="all">All</option>' +
        subs.map(function (s) { return '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>'; }).join('');
    } catch (e) {
      filterSub.innerHTML = '<option value="">Error</option>';
    }
  }
  if (filterMain) filterMain.addEventListener('change', function () { loadFilterSubCategories(this.value || null); });
  loadFilterMainCategories();

  // Item form: main + sub category (load main on init, load sub when main selected)
  var itemMainSel = document.getElementById('item-main-category');
  var itemSubSel = document.getElementById('item-sub-category');
  async function loadItemFormMainCategories() {
    if (!itemMainSel) return;
    try {
      var mains = await api.getMainCategories();
      itemMainSel.innerHTML = '<option value="" data-i18n="select_placeholder">— Select —</option>' +
        mains.map(function (m) { return '<option value="' + m.id + '">' + escapeHtml(m.name) + '</option>'; }).join('');
    } catch (e) {
      itemMainSel.innerHTML = '<option value="">Error</option>';
    }
  }
  if (itemMainSel) {
    itemMainSel.addEventListener('change', function () {
      var mainId = this.value || null;
      if (!itemSubSel) return;
      itemSubSel.innerHTML = '<option value="" data-i18n="select_placeholder">— Select —</option>';
      if (!mainId) return;
      api.getSubCategories(mainId).then(function (subs) {
        itemSubSel.innerHTML = '<option value="" data-i18n="select_placeholder">— Select —</option>' +
          subs.map(function (s) { return '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>'; }).join('');
      });
    });
  }
  loadItemFormMainCategories();

  document.getElementById('btn-add-item').addEventListener('click', openAdd);
  document.getElementById('btn-apply-filters').addEventListener('click', loadItems);
  document.getElementById('filter-status').addEventListener('change', loadItems);
  document.getElementById('filter-sub-category').addEventListener('change', loadItems);
  document.getElementById('filter-search').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); loadItems(); }
  });
  document.getElementById('btn-clear-filters').addEventListener('click', function () {
    document.getElementById('filter-status').value = '';
    if (filterMain) filterMain.value = '';
    loadFilterSubCategories(null);
    if (filterSub) filterSub.value = '';
    document.getElementById('filter-search').value = '';
    loadItems();
  });
  var itemSourcePlatformSelect = document.getElementById('item-source_platform');
  if (itemSourcePlatformSelect) itemSourcePlatformSelect.addEventListener('change', toggleItemSourcePlatformOther);
  var itemAcquisitionTypeSelect = document.getElementById('item-acquisition_type');
  if (itemAcquisitionTypeSelect) itemAcquisitionTypeSelect.addEventListener('change', toggleItemAcquisitionCost);
  var itemToggleExact = document.getElementById('item-toggle-exact-location');
  if (itemToggleExact) {
    itemToggleExact.addEventListener('click', function (e) {
      e.preventDefault();
      var wrap = document.getElementById('item-exact-location-wrap');
      var input = document.getElementById('item-exact_location');
      if (wrap.classList.contains('hidden')) {
        wrap.classList.remove('hidden');
        itemToggleExact.textContent = (typeof t !== 'undefined' ? (t('hide_exact_location') || '− Hide exact location') : '− Hide exact location');
      } else {
        wrap.classList.add('hidden');
        if (input) input.value = '';
        itemToggleExact.textContent = (typeof t !== 'undefined' ? (t('add_exact_location') || '+ Add exact location (optional)') : '+ Add exact location (optional)');
      }
    });
  }
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.getElementById('reserve-modal-close').addEventListener('click', closeReserveModal);
  document.getElementById('reserve-modal-cancel').addEventListener('click', closeReserveModal);
  document.getElementById('reserve-modal-save').addEventListener('click', saveReserve);
  document.getElementById('reserve-modal').addEventListener('click', function (e) { if (e.target === document.getElementById('reserve-modal')) closeReserveModal(); });

  var urlParams = new URLSearchParams(window.location.search);
  var statusFromUrl = urlParams.get('status');
  if (statusFromUrl) {
    var filterStatus = document.getElementById('filter-status');
    if (filterStatus && statuses.indexOf(statusFromUrl) !== -1) filterStatus.value = statusFromUrl;
  }
  loadItems();

  var editId = urlParams.get('id');
  if (editId) openEdit(parseInt(editId, 10));
})();
