// File: frontend/js/sales.js

(function () {
  const alertEl = document.getElementById('alert');
  const listEl = document.getElementById('sales-list');
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('sale-form');

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
  async function loadSales() {
    try {
      listEl.innerHTML = '<p class="loading">' + (typeof t !== 'undefined' ? t('loading') : 'Loading…') + '</p>';
      const sales = await api.getSales();
      if (sales.length === 0) {
        var noSales = (typeof t !== 'undefined' ? t('no_sales_yet') : 'No sales yet.');
        var noSalesHint = (typeof t !== 'undefined' ? t('no_sales_hint') : 'Sale records appear here when you use Output (Sell/Rent) → Sell tab, or the New sale button above.');
        listEl.innerHTML = '<p class="empty-state">' + noSales + '</p><p class="empty-state" style="font-size:0.9rem;margin-top:0.5rem;">' + noSalesHint + '</p>';
        return;
      }
      var T = typeof t !== 'undefined' ? t : function (k) { return k; };
      listEl.innerHTML = '<div class="table-wrap"><table><thead><tr><th>' + T('id') + '</th><th>' + T('item') + '</th><th>' + T('customer') + '</th><th>Price (¥)</th><th>' + T('sale_date') + '</th><th>' + T('platform_sold') + '</th></tr></thead><tbody>' +
        sales.map(function (s) {
          var dateStr = s.sale_date ? String(s.sale_date).slice(0, 10) : '—';
          var itemLink = '<a href="items.html?id=' + (s.item_id || '') + '" class="table-link">' + escapeHtml(s.item_title) + '</a>';
          var custLink = '<a href="customers.html?id=' + (s.customer_id || '') + '" class="table-link">' + escapeHtml(s.customer_name) + '</a>';
          return '<tr><td>' + s.id + '</td><td>' + itemLink + '</td><td>' + custLink + '</td><td>' + (s.sale_price != null ? s.sale_price : '—') + '</td><td>' + dateStr + '</td><td>' + escapeHtml(s.customer_platform || '—') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    } catch (e) {
      listEl.innerHTML = '<p class="empty-state">' + (typeof t !== 'undefined' ? t('error_prefix') : 'Error: ') + escapeHtml(e.message) + '</p>';
      showAlert(e.message, 'error');
    }
  }

  async function openNewSale() {
    form.reset();
    document.getElementById('sale-sale_date').value = new Date().toISOString().slice(0, 10);
    try {
      const [customers, items] = await Promise.all([
        api.getCustomers(),
        api.getItems({ status: 'in_stock' })
      ]);
      const listed = await api.getItems({ status: 'listed' });
      const availableItems = items.concat(listed.filter(function (i) { return !items.find(function (x) { return x.id === i.id; }); }));
      var selCust = (typeof t !== 'undefined' ? t('select_customer_short') : '— Select customer —');
      var opt = '<option value="">' + selCust + '</option>' + customers.map(function (c) { return '<option value="' + c.id + '">' + escapeHtml(c.name) + ' (#' + c.id + ')</option>'; }).join('');
      document.getElementById('sale-customer_id').innerHTML = opt;
      var selItem = (typeof t !== 'undefined' ? t('select_item_placeholder') : '— Select item —');
      opt = '<option value="">' + selItem + '</option>' + availableItems.map(function (i) { return '<option value="' + i.id + '">' + escapeHtml(i.title) + ' (#' + i.id + ')</option>'; }).join('');
      document.getElementById('sale-item_id').innerHTML = opt;
    } catch (e) {
      showAlert(e.message, 'error');
      return;
    }
    overlay.classList.remove('hidden');
  }

  function closeModal() {
    overlay.classList.add('hidden');
    hideAlert();
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();
    const body = {
      item_id: parseInt(document.getElementById('sale-item_id').value, 10),
      customer_id: parseInt(document.getElementById('sale-customer_id').value, 10),
      sale_price: parseFloat(document.getElementById('sale-sale_price').value),
      sale_date: document.getElementById('sale-sale_date').value,
      exact_location: document.getElementById('sale-exact_location') ? document.getElementById('sale-exact_location').value.trim() || null : null
    };
    try {
      await api.createSale(body);
      showAlert((typeof t !== 'undefined' ? t('sale_created') : 'Sale created. Item status set to sold.'), 'success');
      closeModal();
      loadSales();
    } catch (e) {
      showAlert(e.message, 'error');
    }
  });

  document.getElementById('btn-new-sale').addEventListener('click', openNewSale);
  var saleToggleExact = document.getElementById('sale-toggle-exact-location');
  if (saleToggleExact) {
    saleToggleExact.addEventListener('click', function (e) {
      e.preventDefault();
      var wrap = document.getElementById('sale-exact-location-wrap');
      var input = document.getElementById('sale-exact_location');
      if (wrap.classList.contains('hidden')) {
        wrap.classList.remove('hidden');
        saleToggleExact.textContent = (typeof t !== 'undefined' ? t('hide_exact_location') : '− Hide exact location');
      } else {
        wrap.classList.add('hidden');
        if (input) input.value = '';
        saleToggleExact.textContent = (typeof t !== 'undefined' ? t('add_exact_location_where') : '+ Add exact location — where item will go (optional)');
      }
    });
  }
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

  loadSales();
})();
