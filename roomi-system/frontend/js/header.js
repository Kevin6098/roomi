(function () {
  var header = document.querySelector('.app-header');
  var toggle = document.querySelector('.nav-toggle');
  if (!header || !toggle) return;
  function setOpen(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', function () {
    setOpen(!header.classList.contains('nav-open'));
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      setOpen(false);
    });
  });
})();
