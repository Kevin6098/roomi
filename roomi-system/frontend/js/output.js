// File: frontend/js/output.js
// Output page: Sell and Rent tabs, item picker, end rental

(function () {
  const alertEl = document.getElementById('alert');
  const toastContainer = document.getElementById('toast-container');
  let availableItems = [];
  let customers = [];

  function showAlert(msg, type) {
    alertEl.textContent = msg;
    alertEl.className = 'alert alert-' + (type || 'info');
    alertEl.classList.remove('hidden');
  }
  function hideAlert() { alertEl.classList.add('hidden'); }
  function showToast(msg, type) {
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
  function todayLocal() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var pane = document.getElementById('pane-' + tab);
      if (pane) pane.classList.add('active');
      if (tab === 'rent') loadActiveRentals();
    });
  });

  async function loadAvailableItems(params) {
    params = params || {};
    availableItems = await api.getAvailableItems(params);
    return availableItems;
  }

  function fillItemSelect(selectId, searchVal, preselectId) {
    var sel = document.getElementById(selectId);
    var opts = availableItems;
    if (searchVal && searchVal.trim()) {
      var q = searchVal.trim().toLowerCase();
      opts = opts.filter(function (i) { return (i.title || '').toLowerCase().indexOf(q) >= 0; });
    }
    sel.innerHTML = '<option value="">' + (typeof t !== 'undefined' ? t('select_item_placeholder') : '— Select item —') + '</option>' + opts.map(function (i) {
      var loc = (i.exact_location != null && i.exact_location !== '') ? i.exact_location : (typeof t !== 'undefined' ? t('undecided_yet') : 'Undecided yet');
      return '<option value="' + i.id + '">' + escapeHtml(i.title) + ' (#' + i.id + ' — ' + escapeHtml(loc) + ')</option>';
    }).join('');
    if (preselectId && sel.querySelector('option[value="' + preselectId + '"]')) sel.value = preselectId;
  }

  async function loadCustomers() {
    customers = await api.getCustomers();
    var opt = '<option value="">' + (typeof t !== 'undefined' ? t('select_customer_placeholder') : '— Select existing or add new below —') + '</option>' + customers.map(function (c) {
      return '<option value="' + c.id + '">' + escapeHtml(c.name) + ' (#' + c.id + ')</option>';
    }).join('');
    document.getElementById('sell-customer_id').innerHTML = opt;
    document.getElementById('rent-customer_id').innerHTML = opt;
  }

  async function initOutput() {
    try {
      hideAlert();
      await loadAvailableItems();
      await loadCustomers();
      var params = new URLSearchParams(window.location.search);
      var itemId = params.get('item_id');
      var hash = (window.location.hash || '').replace('#', '');
      var tab = (hash === 'rent' || hash === 'sell') ? hash : null;
      fillItemSelect('sell-item_id', null, tab === 'sell' ? itemId : null);
      fillItemSelect('rent-item_id', null, tab === 'rent' ? itemId : null);
      document.getElementById('sell-sale_date').value = todayLocal();
      document.getElementById('rent-start_date').value = todayLocal();
      if (tab === 'rent') {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });
        var rentBtn = document.querySelector('.tab-btn[data-tab="rent"]');
        if (rentBtn) rentBtn.classList.add('active');
        var rentPane = document.getElementById('pane-rent');
        if (rentPane) rentPane.classList.add('active');
        loadActiveRentals();
      } else if (tab === 'sell') {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });
        var sellBtn = document.querySelector('.tab-btn[data-tab="sell"]');
        if (sellBtn) sellBtn.classList.add('active');
        var sellPane = document.getElementById('pane-sell');
        if (sellPane) sellPane.classList.add('active');
      }
    } catch (e) {
      showAlert('Failed to load: ' + e.message, 'error');
    }
  }

  document.getElementById('sell-search').addEventListener('input', function () {
    fillItemSelect('sell-item_id', this.value);
  });
  document.getElementById('rent-search').addEventListener('input', function () {
    fillItemSelect('rent-item_id', this.value);
  });

  document.getElementById('sell-use-new-customer').addEventListener('change', function () {
    document.getElementById('sell-quick-customer').style.display = this.checked ? 'block' : 'none';
    document.getElementById('sell-customer_id').required = !this.checked;
  });
  document.getElementById('rent-use-new-customer').addEventListener('change', function () {
    document.getElementById('rent-quick-customer').style.display = this.checked ? 'block' : 'none';
    document.getElementById('rent-customer_id').required = !this.checked;
  });

  function getNewCustomerPlatform(prefix) {
    var sel = document.getElementById(prefix + '-new-platform');
    var other = document.getElementById(prefix + '-new-platform-other');
    if (!sel) return null;
    if (sel.value === 'other' && other) return (other.value && other.value.trim()) ? other.value.trim() : null;
    return sel.value && sel.value.trim() ? sel.value.trim() : null;
  }
  function togglePlatformOther(prefix) {
    var sel = document.getElementById(prefix + '-new-platform');
    var other = document.getElementById(prefix + '-new-platform-other');
    if (!sel || !other) return;
    if (sel.value === 'other') { other.classList.remove('hidden'); other.focus(); } else { other.classList.add('hidden'); other.value = ''; }
  }
  document.getElementById('sell-new-platform').addEventListener('change', function () { togglePlatformOther('sell'); });
  document.getElementById('rent-new-platform').addEventListener('change', function () { togglePlatformOther('rent'); });

  function toggleExactLocation(prefix) {
    var wrap = document.getElementById(prefix + '-exact-location-wrap');
    var link = document.getElementById(prefix + '-toggle-exact-location');
    var input = document.getElementById(prefix + '-exact_location');
    if (!wrap || !link) return;
    if (wrap.classList.contains('hidden')) {
      wrap.classList.remove('hidden');
      link.textContent = (typeof t !== 'undefined' ? t('hide_exact_location') : '− Hide exact location');
    } else {
      wrap.classList.add('hidden');
      if (input) input.value = '';
      link.textContent = (typeof t !== 'undefined' ? t('add_exact_location_where') : '+ Add exact location — where item will go (optional)');
    }
  }
  document.getElementById('sell-toggle-exact-location').addEventListener('click', function (e) { e.preventDefault(); toggleExactLocation('sell'); });
  document.getElementById('rent-toggle-exact-location').addEventListener('click', function (e) { e.preventDefault(); toggleExactLocation('rent'); });

  // Sell form
  document.getElementById('sell-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    var itemId = document.getElementById('sell-item_id').value;
    var useNew = document.getElementById('sell-use-new-customer').checked;
    var salePrice = document.getElementById('sell-sale_price').value;
    var saleDate = document.getElementById('sell-sale_date').value;
    if (!itemId || !salePrice || !saleDate) {
      showAlert('Please select an item and enter sale price and date.', 'error');
      return;
    }
    if (!useNew && !document.getElementById('sell-customer_id').value) {
      showAlert('Please select a customer or use "Use new customer".', 'error');
      return;
    }
    if (!confirm('Confirm sale? Item will be marked as sold.')) return;
    var body = {
      item_id: parseInt(itemId, 10),
      sale_price: parseFloat(salePrice),
      sale_date: saleDate,
      notes: document.getElementById('sell-notes').value.trim() || null,
      exact_location: document.getElementById('sell-exact_location') ? document.getElementById('sell-exact_location').value.trim() || null : null
    };
    if (useNew) {
      var name = document.getElementById('sell-new-name').value.trim();
      if (!name) { showAlert('Enter new customer name.', 'error'); return; }
      var platform = getNewCustomerPlatform('sell');
      body.customer_payload = {
        name: name,
        platform: platform || null,
        app_id: document.getElementById('sell-new-app_id').value.trim() || null
      };
    } else {
      body.customer_id = parseInt(document.getElementById('sell-customer_id').value, 10);
    }
    try {
      await api.outputSell(body);
      showToast('Sale recorded. Item marked as sold.');
      var successMsg = 'Sale recorded. Item marked as sold.';
      if (useNew) successMsg += ' New customer was saved — see Customers page.';
      successMsg += ' See Sales page for the record.';
      showAlert(successMsg, 'success');
      document.getElementById('sell-form').reset();
      document.getElementById('sell-sale_date').value = todayLocal();
      document.getElementById('sell-quick-customer').style.display = 'none';
      document.getElementById('sell-use-new-customer').checked = false;
      document.getElementById('sell-exact-location-wrap').classList.add('hidden');
      if (document.getElementById('sell-exact_location')) document.getElementById('sell-exact_location').value = '';
      document.getElementById('sell-toggle-exact-location').textContent = (typeof t !== 'undefined' ? t('add_exact_location_where') : '+ Add exact location — where item will go (optional)');
      initOutput();
    } catch (err) {
      var msg = err.message || 'Request failed';
      if (msg === 'Failed to fetch' || msg.indexOf('NetworkError') !== -1) {
        msg = 'Could not reach the server. Is the backend running? (e.g. npm run dev from project root)';
      }
      showAlert(msg, 'error');
    }
  });

  // Rent form
  document.getElementById('rent-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    var itemId = document.getElementById('rent-item_id').value;
    var useNew = document.getElementById('rent-use-new-customer').checked;
    var monthly = document.getElementById('rent-rent_price_monthly').value;
    var startDate = document.getElementById('rent-start_date').value;
    if (!itemId || !monthly || !startDate) {
      showAlert('Please select an item and enter monthly rent and start date.', 'error');
      return;
    }
    if (!useNew && !document.getElementById('rent-customer_id').value) {
      showAlert('Please select a customer or use "Use new customer".', 'error');
      return;
    }
    if (!confirm('Confirm rental? Item will be marked as rented.')) return;
    var body = {
      item_id: parseInt(itemId, 10),
      rent_price_monthly: parseFloat(monthly),
      deposit: document.getElementById('rent-deposit').value ? parseFloat(document.getElementById('rent-deposit').value) : null,
      start_date: startDate,
      expected_end_date: document.getElementById('rent-expected_end_date').value || null,
      notes: document.getElementById('rent-notes').value.trim() || null,
      exact_location: document.getElementById('rent-exact_location') ? document.getElementById('rent-exact_location').value.trim() || null : null
    };
    if (useNew) {
      var name = document.getElementById('rent-new-name').value.trim();
      if (!name) { showAlert('Enter new customer name.', 'error'); return; }
      var platform = getNewCustomerPlatform('rent');
      body.customer_payload = {
        name: name,
        platform: platform || null,
        app_id: document.getElementById('rent-new-app_id').value.trim() || null
      };
    } else {
      body.customer_id = parseInt(document.getElementById('rent-customer_id').value, 10);
    }
    try {
      await api.outputRent(body);
      showToast('Rental started. Item marked as rented.');
      showAlert('Rental started. See Rentals page for the record. You can end it below when the item is returned.', 'success');
      document.getElementById('rent-form').reset();
      document.getElementById('rent-start_date').value = todayLocal();
      document.getElementById('rent-quick-customer').style.display = 'none';
      document.getElementById('rent-use-new-customer').checked = false;
      document.getElementById('rent-exact-location-wrap').classList.add('hidden');
      if (document.getElementById('rent-exact_location')) document.getElementById('rent-exact_location').value = '';
      document.getElementById('rent-toggle-exact-location').textContent = (typeof t !== 'undefined' ? t('add_exact_location_where') : '+ Add exact location — where item will go (optional)');
      initOutput();
      loadActiveRentals();
    } catch (err) {
      var msg = err.message || 'Request failed';
      if (msg === 'Failed to fetch' || msg.indexOf('NetworkError') !== -1) {
        msg = 'Could not reach the server. Is the backend running?';
      }
      showAlert(msg, 'error');
    }
  });

  // Active rentals & end rental
  async function loadActiveRentals() {
    var el = document.getElementById('active-rentals');
    if (!el) return;
    try {
      var list = await api.getRentals({ status: 'active' });
      if (!Array.isArray(list)) {
        el.innerHTML = '<p class="empty-state">' + (typeof t !== 'undefined' ? t('error_unexpected') : 'Error: unexpected response.') + '</p>';
        return;
      }
      if (list.length === 0) {
        el.innerHTML = '<p class="empty-state">No active rentals.</p>';
        return;
      }
      var itemH = (typeof t !== 'undefined' ? t('item') : 'Item');
      var custH = (typeof t !== 'undefined' ? t('customer') : 'Customer');
      var startH = (typeof t !== 'undefined' ? t('start') : 'Start');
      var monthlyH = (typeof t !== 'undefined' ? t('monthly') : 'Monthly');
      el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>' + itemH + '</th><th>' + custH + '</th><th>' + startH + '</th><th>' + monthlyH + '</th><th></th></tr></thead><tbody>' +
        list.map(function (r) {
          var startStr = r.start_date ? String(r.start_date).slice(0, 10) : '—';
          var itemLink = '<a href="items.html?id=' + (r.item_id || '') + '" class="table-link">' + escapeHtml(r.item_title) + '</a>';
          var custLink = '<a href="customers.html?id=' + (r.customer_id || '') + '" class="table-link">' + escapeHtml(r.customer_name) + '</a>';
          return '<tr><td>' + itemLink + '</td><td>' + custLink + '</td><td>' + startStr + '</td><td>¥' + (r.rent_price_monthly != null ? r.rent_price_monthly : '—') + '</td><td><button type="button" class="btn btn-sm btn-warning btn-end-rental" data-id="' + r.id + '">End rental</button></td></tr>';
        }).join('') + '</tbody></table></div>';
      el.querySelectorAll('.btn-end-rental').forEach(function (btn) {
        btn.addEventListener('click', function () { openEndRentalModal(parseInt(btn.dataset.id, 10)); });
      });
    } catch (e) {
      var msg = (e && e.message) ? e.message : 'Error loading rentals.';
      if (msg === 'Failed to fetch' || msg.indexOf('NetworkError') !== -1) {
        msg = 'Could not reach the server. Is the backend running?';
      }
      el.innerHTML = '<p class="empty-state">' + escapeHtml(msg) + '</p>';
    }
  }

  var endModal = document.getElementById('end-rental-modal');
  function openEndRentalModal(rentalId) {
    document.getElementById('end-rental-id').value = rentalId;
    document.getElementById('end-rental-date').value = todayLocal();
    document.getElementById('end-rental-damage').value = '';
    document.getElementById('end-rental-item-status').value = 'in_stock';
    endModal.classList.remove('hidden');
  }
  function closeEndRentalModal() {
    endModal.classList.add('hidden');
  }
  document.getElementById('end-rental-close').addEventListener('click', closeEndRentalModal);
  document.getElementById('end-rental-cancel').addEventListener('click', closeEndRentalModal);
  endModal.addEventListener('click', function (ev) { if (ev.target === endModal) closeEndRentalModal(); });

  document.getElementById('end-rental-confirm').addEventListener('click', async function () {
    var id = document.getElementById('end-rental-id').value;
    var endDate = document.getElementById('end-rental-date').value;
    var itemStatus = document.getElementById('end-rental-item-status').value;
    var damage = document.getElementById('end-rental-damage').value;
    if (!endDate) { showAlert('Enter end date.', 'error'); return; }
    if (!confirm('End this rental? Item will return to: ' + itemStatus + '.')) return;
    try {
      await api.outputEndRental(id, {
        end_date: endDate,
        item_next_status: itemStatus,
        damage_fee: damage ? parseFloat(damage) : null
      });
      showToast('Rental ended. Item returned to ' + itemStatus + '.');
      closeEndRentalModal();
      loadActiveRentals();
      initOutput();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  });

  initOutput();
})();
