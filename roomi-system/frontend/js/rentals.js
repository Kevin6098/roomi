// File: frontend/js/rentals.js

(function () {
  const alertEl = document.getElementById('alert');
  const listEl = document.getElementById('rentals-list');
  const overlay = document.getElementById('modal-overlay');
  const damageOverlay = document.getElementById('damage-modal');
  const form = document.getElementById('rental-form');
  const modalTitle = document.getElementById('modal-title');
  const rentalIdEl = document.getElementById('rental-id');
  const rentalStatusGroup = document.getElementById('rental-status-group');
  const rentalDamageGroup = document.getElementById('rental-damage-group');
  let damageRentalId = null;

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
  function getFilterStatus() {
    return document.getElementById('filter-status').value || undefined;
  }

  async function loadRentals() {
    try {
      var T = typeof t !== 'undefined' ? t : function (k) { return k; };
      listEl.innerHTML = '<p class="loading">' + T('loading') + '</p>';
      const params = getFilterStatus() ? { status: getFilterStatus() } : {};
      const rentals = await api.getRentals(params);
      if (rentals.length === 0) {
        var noRentals = T('no_rentals_match');
        var noRentalsHint = T('no_rentals_hint');
        listEl.innerHTML = '<p class="empty-state">' + noRentals + '</p><p class="empty-state" style="font-size:0.9rem;margin-top:0.5rem;">' + noRentalsHint + '</p>';
        return;
      }
      listEl.innerHTML = '<div class="table-wrap"><table><thead><tr><th>' + T('id') + '</th><th>' + T('item') + '</th><th>' + T('customer') + '</th><th>' + T('monthly') + '</th><th>' + T('start') + '</th><th>' + T('end') + '</th><th>' + T('status') + '</th><th>' + T('damage_fee') + '</th><th>' + T('actions') + '</th></tr></thead><tbody>' +
        rentals.map(function (r) {
          var actions = '<div class="btn-group">';
          if (r.status === 'active') {
            actions += '<button type="button" class="btn btn-sm btn-secondary btn-end-rental" data-id="' + r.id + '">' + T('end_rental') + '</button>';
            actions += '<button type="button" class="btn btn-sm btn-warning btn-damage" data-id="' + r.id + '" data-original="' + (r.item_original_price || '') + '">' + T('mark_damaged') + '</button>';
          }
          actions += '</div>';
          var startStr = r.start_date ? String(r.start_date).slice(0, 10) : '—';
          var endStr = r.end_date ? String(r.end_date).slice(0, 10) : '—';
          var itemLink = '<a href="items.html?id=' + (r.item_id || '') + '" class="table-link">' + escapeHtml(r.item_title) + '</a>';
          var custLink = '<a href="customers.html?id=' + (r.customer_id || '') + '" class="table-link">' + escapeHtml(r.customer_name) + '</a>';
          return '<tr><td>' + r.id + '</td><td>' + itemLink + '</td><td>' + custLink + '</td><td>' + (r.rent_price_monthly != null ? r.rent_price_monthly : '—') + '</td><td>' + startStr + '</td><td>' + endStr + '</td><td><span class="badge badge-' + r.status + '">' + r.status + '</span></td><td>' + (r.damage_fee != null ? '¥' + r.damage_fee : '—') + '</td><td>' + actions + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      listEl.querySelectorAll('.btn-end-rental').forEach(function (btn) {
        btn.addEventListener('click', function () { openEndRental(parseInt(btn.dataset.id, 10)); });
      });
      listEl.querySelectorAll('.btn-damage').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openDamageModal(parseInt(btn.dataset.id, 10), btn.dataset.original ? parseFloat(btn.dataset.original) : 0);
        });
      });
    } catch (e) {
      listEl.innerHTML = '<p class="empty-state">' + (typeof t !== 'undefined' ? t('error_prefix') : 'Error: ') + escapeHtml(e.message) + '</p>';
      showAlert(e.message, 'error');
    }
  }

  async function openNewRental() {
    rentalIdEl.value = '';
    form.reset();
    rentalStatusGroup.style.display = 'none';
    rentalDamageGroup.style.display = 'none';
    document.getElementById('rental-item_id').required = true;
    document.getElementById('rental-customer_id').required = true;
    document.getElementById('rental-rent_price_monthly').required = true;
    document.getElementById('rental-start_date').required = true;
    document.getElementById('rental-start_date').value = new Date().toISOString().slice(0, 10);
    try {
      const [customers, items] = await Promise.all([api.getCustomers(), api.getItems({ status: 'in_stock' })]);
      const listed = await api.getItems({ status: 'listed' });
      const availableItems = items.concat(listed.filter(function (i) { return !items.find(function (x) { return x.id === i.id; }); }));
      var T2 = typeof t !== 'undefined' ? t : function (k) { return k; };
      var opt = '<option value="">' + T2('select_customer_short') + '</option>' + customers.map(function (c) { return '<option value="' + c.id + '">' + escapeHtml(c.name) + ' (#' + c.id + ')</option>'; }).join('');
      document.getElementById('rental-customer_id').innerHTML = opt;
      opt = '<option value="">' + T2('select_item_placeholder') + '</option>' + availableItems.map(function (i) { return '<option value="' + i.id + '">' + escapeHtml(i.title) + ' (#' + i.id + ')</option>'; }).join('');
      document.getElementById('rental-item_id').innerHTML = opt;
    } catch (e) {
      showAlert(e.message, 'error');
      return;
    }
    modalTitle.textContent = (typeof t !== 'undefined' ? t('modal_new_rental') : 'New rental');
    overlay.classList.remove('hidden');
  }

  async function openEndRental(id) {
    try {
      const r = await api.getRental(id);
      rentalIdEl.value = r.id;
      document.getElementById('rental-customer_id').value = r.customer_id;
      document.getElementById('rental-item_id').value = r.item_id;
      document.getElementById('rental-rent_price_monthly').value = r.rent_price_monthly;
      document.getElementById('rental-deposit').value = r.deposit != null ? r.deposit : '';
      document.getElementById('rental-start_date').value = r.start_date ? String(r.start_date).slice(0, 10) : '';
      document.getElementById('rental-end_date').value = new Date().toISOString().slice(0, 10);
      document.getElementById('rental-status').value = 'ended';
      document.getElementById('rental-notes').value = r.notes || '';
      document.getElementById('rental-customer_id').disabled = true;
      document.getElementById('rental-item_id').disabled = true;
      document.getElementById('rental-rent_price_monthly').disabled = true;
      document.getElementById('rental-start_date').disabled = true;
      rentalStatusGroup.style.display = 'block';
      rentalDamageGroup.style.display = 'block';
      document.getElementById('rental-damage_fee').value = r.damage_fee != null ? r.damage_fee : '';
      document.getElementById('rental-item_id').required = false;
      document.getElementById('rental-customer_id').required = false;
      document.getElementById('rental-rent_price_monthly').required = false;
      document.getElementById('rental-start_date').required = false;
      modalTitle.textContent = (typeof t !== 'undefined' ? t('end_rental') : 'End rental');
      overlay.classList.remove('hidden');
    } catch (e) {
      showAlert(e.message, 'error');
    }
  }

  function closeModal() {
    overlay.classList.add('hidden');
    document.getElementById('rental-customer_id').disabled = false;
    document.getElementById('rental-item_id').disabled = false;
    document.getElementById('rental-rent_price_monthly').disabled = false;
    document.getElementById('rental-start_date').disabled = false;
    hideAlert();
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    const id = rentalIdEl.value;
    const body = {
      item_id: parseInt(document.getElementById('rental-item_id').value, 10),
      customer_id: parseInt(document.getElementById('rental-customer_id').value, 10),
      rent_price_monthly: parseFloat(document.getElementById('rental-rent_price_monthly').value),
      deposit: document.getElementById('rental-deposit').value ? parseFloat(document.getElementById('rental-deposit').value) : null,
      start_date: document.getElementById('rental-start_date').value,
      end_date: document.getElementById('rental-end_date').value || null,
      notes: document.getElementById('rental-notes').value.trim() || null,
      exact_location: document.getElementById('rental-exact_location') ? document.getElementById('rental-exact_location').value.trim() || null : null
    };
    if (id) {
      body.status = document.getElementById('rental-status').value;
      body.end_date = document.getElementById('rental-end_date').value || null;
      body.damage_fee = document.getElementById('rental-damage_fee').value ? parseFloat(document.getElementById('rental-damage_fee').value) : null;
    }
    try {
      if (id) {
        await api.updateRental(id, body);
        showAlert((typeof t !== 'undefined' ? t('rental_ended_msg') : 'Rental ended. Item set back to in_stock.'), 'success');
      } else {
        await api.createRental(body);
        showAlert((typeof t !== 'undefined' ? t('rental_created') : 'Rental created. Item set to rented.'), 'success');
      }
      closeModal();
      loadRentals();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  });

  function openDamageModal(rentalId, defaultFee) {
    damageRentalId = rentalId;
    document.getElementById('damage-fee-input').value = defaultFee || '';
    damageOverlay.classList.remove('hidden');
  }

  function closeDamageModal() {
    damageOverlay.classList.add('hidden');
    damageRentalId = null;
  }

  document.getElementById('damage-modal-save').addEventListener('click', async function () {
    if (damageRentalId == null) return;
    var fee = parseFloat(document.getElementById('damage-fee-input').value);
    if (isNaN(fee) || fee < 0) fee = 0;
    try {
      await api.setRentalDamage(damageRentalId, fee);
      showAlert((typeof t !== 'undefined' ? t('damage_fee_set') : 'Damage fee set.'), 'success');
      closeDamageModal();
      loadRentals();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  });

  document.getElementById('btn-new-rental').addEventListener('click', openNewRental);
  var rentalToggleExact = document.getElementById('rental-toggle-exact-location');
  if (rentalToggleExact) {
    rentalToggleExact.addEventListener('click', function (e) {
      e.preventDefault();
      var wrap = document.getElementById('rental-exact-location-wrap');
      var input = document.getElementById('rental-exact_location');
      if (wrap.classList.contains('hidden')) {
        wrap.classList.remove('hidden');
        rentalToggleExact.textContent = (typeof t !== 'undefined' ? t('hide_exact_location') : '− Hide exact location');
      } else {
        wrap.classList.add('hidden');
        if (input) input.value = '';
        rentalToggleExact.textContent = (typeof t !== 'undefined' ? t('add_exact_location_where') : '+ Add exact location — where item will go (optional)');
      }
    });
  }
  document.getElementById('btn-apply-filters').addEventListener('click', loadRentals);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.getElementById('damage-modal-close').addEventListener('click', closeDamageModal);
  document.getElementById('damage-modal-cancel').addEventListener('click', closeDamageModal);
  damageOverlay.addEventListener('click', function (e) { if (e.target === damageOverlay) closeDamageModal(); });

  loadRentals();
})();
