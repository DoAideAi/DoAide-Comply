/* DoAide Comply embeddable widget.
 * <div data-doaide-comply data-type="pvt_ltd" data-state="Karnataka"></div>
 * <script src="https://comply.doaide.com/embed.js" async></script>
 */
(function () {
  var script = document.currentScript || document.querySelector('script[src*="embed.js"]');
  var origin = script ? new URL(script.src).origin : '';
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function render(el) {
    var type = el.getAttribute('data-type') || 'pvt_ltd';
    var state = el.getAttribute('data-state') || 'Delhi';
    var url = origin + '/api/public/widget-data?business_type=' + encodeURIComponent(type) + '&state=' + encodeURIComponent(state) + '&limit=5';
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var rows = (data.items || []).map(function (i) {
        return '<li style="padding:6px 0;border-bottom:1px solid #e2e8f0"><b style="color:#0D9488">' + esc(i.due_date) + '</b> &middot; ' + esc(i.title) + '</li>';
      }).join('');
      el.innerHTML = '<div style="font-family:Inter,system-ui,sans-serif;background:#FFFFFF;color:#0F172A;border:1px solid #0D9488;border-radius:12px;padding:16px;max-width:420px">' +
        '<div style="font-weight:700;color:#0D9488;margin-bottom:8px">Upcoming compliance deadlines</div>' +
        '<ul style="list-style:none;margin:0;padding:0;font-size:14px">' + rows + '</ul>' +
        '<a href="' + origin + '/?type=' + encodeURIComponent(type) + '&state=' + encodeURIComponent(state) + '" target="_blank" rel="noopener" style="display:inline-block;margin-top:10px;color:#0D9488;font-size:13px">Get your full free calendar &rarr; DoAide Comply</a></div>';
    }).catch(function () { el.textContent = 'Compliance widget unavailable.'; });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-doaide-comply]'), render);
})();
