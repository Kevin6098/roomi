// File: frontend/js/customers.js

(function () {
  const alertEl = document.getElementById('alert');
  const listEl = document.getElementById('customers-list');
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('customer-form');
  const modalTitle = document.getElementById('modal-title');

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

  async function loadCustomers() {
    try {
      var T = typeof t !== 'undefined' ? t : function (k) { return k; };
      listEl.innerHTML = '<p class="loading">' + T('loading') + '</p>';
      const customers = await api.getCustomers();
      if (customers.length === 0) {
        listEl.innerHTML = '<p class="empty-state">' + T('no_customers') + '</p>';
        return;
      }
      listEl.innerHTML = '<div class="table-wrap"><table><thead><tr><th>' + T('id') + '</th><th>' + T('name') + '</th><th>' + T('phone_label') + '</th><th>' + T('email_label') + '</th><th>' + T('language') + '</th><th>' + T('type') + '</th><th>' + T('actions') + '</th></tr></thead><tbody>' +
        customers.map(function (c) {
          var nameLink = '<a href="customers.html?id=' + c.id + '" class="table-link">' + escapeHtml(c.name) + '</a>';
          return '<tr><td><a href="customers.html?id=' + c.id + '" class="table-link">' + c.id + '</a></td><td>' + nameLink + '</td><td>' + escapeHtml(c.phone || '—') + '</td><td>' + escapeHtml(c.email || '—') + '</td><td>' + (c.preferred_language || 'jp') + '</td><td>' + (c.customer_type || 'both') + '</td><td><button type="button" class="btn btn-sm btn-secondary btn-edit" data-id="' + c.id + '">' + T('edit') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>';
      listEl.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () { openEdit(parseInt(btn.dataset.id, 10)); });
      });
    } catch (e) {
      listEl.innerHTML = '<p class="empty-state">' + (typeof t !== 'undefined' ? t('error_prefix') : 'Error: ') + escapeHtml(e.message) + '</p>';
      showAlert(e.message, 'error');
    }
  }

  function openAdd() {
    document.getElementById('customer-id').value = '';
    form.reset();
    document.getElementById('customer-preferred_language').value = 'jp';
    document.getElementById('customer-customer_type').value = 'both';
    modalTitle.textContent = (typeof t !== 'undefined' ? t('modal_add_customer') : 'Add customer');
    overlay.classList.remove('hidden');
  }

  async function openEdit(id) {
    try {
      const c = await api.getCustomer(id);
      document.getElementById('customer-id').value = c.id;
      document.getElementById('customer-name').value = c.name || '';
      document.getElementById('customer-phone').value = c.phone || '';
      document.getElementById('customer-email').value = c.email || '';
      document.getElementById('customer-preferred_language').value = c.preferred_language || 'jp';
      document.getElementById('customer-customer_type').value = c.customer_type || 'both';
      modalTitle.textContent = (typeof t !== 'undefined' ? t('modal_edit_customer') : 'Edit customer');
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
    const id = document.getElementById('customer-id').value;
    const body = {
      name: document.getElementById('customer-name').value.trim(),
      phone: document.getElementById('customer-phone').value.trim() || null,
      email: document.getElementById('customer-email').value.trim() || null,
      preferred_language: document.getElementById('customer-preferred_language').value,
      customer_type: document.getElementById('customer-customer_type').value
    };
    try {
      if (id) {
        await api.updateCustomer(id, body);
        showAlert((typeof t !== 'undefined' ? t('customer_updated') : 'Customer updated.'), 'success');
      } else {
        await api.createCustomer(body);
        showAlert((typeof t !== 'undefined' ? t('customer_added') : 'Customer added.'), 'success');
      }
      closeModal();
      loadCustomers();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  });

  document.getElementById('btn-add-customer').addEventListener('click', openAdd);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

  loadCustomers();

  var idMatch = window.location.search.match(/[?&]id=(\d+)/);
  if (idMatch) openEdit(parseInt(idMatch[1], 10));
})();
