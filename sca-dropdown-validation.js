/* Question prompts are not answers. Keep existing submit destinations and payloads. */
(function () {
  'use strict';
  if (window.__scaDropdownValidation) return;
  window.__scaDropdownValidation = true;
  const previous = new WeakMap();
  const errors = new WeakMap();
  function shown(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.hidden || getComputedStyle(n).display === 'none') return false;
    }
    return true;
  }
  function required(el) {
    return !el.disabled && shown(el) && (el.required || el.hasAttribute('data-cond-required'));
  }
  function unanswered(el) {
    return !String(el.value || '').trim() || (el.tagName === 'SELECT' && el.selectedOptions[0]?.disabled);
  }
  function clear(el) {
    const error = errors.get(el);
    if (!error) return;
    error.node.remove();
    if (error.described) el.setAttribute('aria-describedby', error.described);
    else el.removeAttribute('aria-describedby');
    el.removeAttribute('aria-invalid');
    errors.delete(el);
  }
  let count = 0;
  function explain(el) {
    if (!errors.has(el)) {
      const node = document.createElement('p');
      node.id = 'sca-choice-error-' + (++count);
      node.setAttribute('role', 'alert');
      node.textContent = el.tagName === 'SELECT' ? 'Please choose an answer to this question before continuing.' : 'Please complete this question before continuing.';
      node.style.cssText = 'color:#991b1b;font-size:14px;line-height:1.4;margin:4px 0 10px';
      const described = el.getAttribute('aria-describedby') || '';
      el.setAttribute('aria-describedby', (described + ' ' + node.id).trim());
      el.setAttribute('aria-invalid', 'true');
      el.insertAdjacentElement('afterend', node);
      errors.set(el, {node, described});
    }
    el.focus({preventScroll: true});
    el.scrollIntoView({block: 'center', behavior: 'smooth'});
  }
  function init() {
    document.querySelectorAll('select').forEach(el => {
      // Retain the initial blank prompt even when its option is disabled.
      const value = el.value;
      Array.from(el.options).forEach(option => { if (option.value === '') option.disabled = true; });
      el.value = value;
      previous.set(el, value);
    });
  }
  document.addEventListener('change', function (event) {
    const el = event.target;
    if (el.tagName !== 'SELECT') { if (el.value) clear(el); return; }
    const root = el.closest('form, #hfcard');
    if (!root) return;
    if (el.value) {
      const controls = Array.from(root.querySelectorAll('input[type="date"], select'));
      const earlier = controls.slice(0, controls.indexOf(el)).find(control => required(control) && unanswered(control));
      if (earlier) {
        el.value = previous.get(el) || '';
        event.stopImmediatePropagation();
        event.preventDefault();
        explain(earlier);
        return;
      }
      clear(el);
    }
    previous.set(el, el.value);
  }, true);
  document.addEventListener('input', event => { if (event.target.value) clear(event.target); }, true);
  document.addEventListener('submit', function (event) {
    const bad = Array.from(event.target.querySelectorAll('select')).find(el => required(el) && unanswered(el));
    if (bad) { event.preventDefault(); event.stopImmediatePropagation(); explain(bad); }
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('astro:page-load', init);
})();
