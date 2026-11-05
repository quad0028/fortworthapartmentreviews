/* Load synchronously in <head>, before the existing form scripts. */
(function () {
  'use strict';
  if (window.__scaGuestCardCopy) return;
  const keys = {
    'dallassecondchanceapartments.com': '2f17fb57167ca0a1f178f43a3ddaa82b',
    'secondchanceapartmentshouston.com': '6a705a8a1214d1d7bffd6e5eac5fd886',
    'austinsecondchanceapartments.com': '97e045d70f466d8f9d7a5b9a4bb0626b',
    'fortworthsecondchanceapartments.com': 'c918d11352a4ca34fa2c4f9e07f313d7',
    'secondchanceapartmentssanantonio.com': '3bcffabee422cf6112d37b2bb0d7c9db'
  };
  const key = keys[location.hostname];
  if (!key) return;
  const originalFetch = window.fetch.bind(window);
  const observations = new WeakMap();
  const loadedAt = new Date().toISOString();
  let submittedForm = null;
  window.__scaGuestCardCopy = true;
  document.addEventListener('change', function (event) {
    if (event.target?.matches('input[type="checkbox"]')) {
      observations.set(event.target, { changedAt: new Date().toISOString(), trustedEvent: event.isTrusted });
      if (event.target.name === 'consent') {
        const timestamp = event.target.form?.querySelector('[name="consentTimestamp"]');
        if (timestamp) timestamp.value = event.target.checked ? new Date().toISOString() : '';
      }
    }
  }, true);
  document.addEventListener('submit', function (event) { submittedForm = event.target; }, true);

  function consentSnapshot() {
    // Austin has a card rather than a conventional submitting form.
    const root = submittedForm || document.getElementById('hfcard') || document;
    return Array.from(root.querySelectorAll('input[type="checkbox"]'))
      .filter(el => /consent/i.test(el.name + ' ' + el.id))
      .map(el => {
        const described = (el.getAttribute('aria-describedby') || '').split(/\s+/)
          .map(id => document.getElementById(id)).filter(Boolean);
        const fallback = el.closest('.field, .fwg-consent')?.querySelector('.consent-text');
        const nodes = described.length ? described : fallback ? [fallback] : Array.from(el.labels || []);
        return {
          control: el.id || el.name,
          checked: el.checked,
          defaultChecked: el.defaultChecked,
          required: el.required,
          text: nodes.map(n => (n.innerText || n.textContent || '').trim()).join('\n'),
          links: nodes.flatMap(n => Array.from(n.querySelectorAll('a[href]')).map(a => ({text: a.textContent.trim(), url: a.href}))),
          observation: observations.get(el) || null
        };
      });
  }

  function fieldsFrom(body) {
    if (typeof body === 'string') {
      try { const value = JSON.parse(body); if (value && typeof value === 'object') return flatten(value); } catch (_) {}
      body = new URLSearchParams(body);
    }
    if (body instanceof URLSearchParams || body instanceof FormData) {
      const fields = Object.create(null);
      for (const [name, value] of body) {
        const text = typeof value === 'string' ? value : '[file omitted]';
        fields[name] = Object.hasOwn(fields, name) ? fields[name] + '\n' + text : text;
      }
      return fields;
    }
    throw new Error('Unsupported guest-card copy');
  }

  function flatten(value, prefix, out) {
    out = out || Object.create(null);
    for (const [name, item] of Object.entries(value)) {
      const path = prefix ? prefix + '.' + name : name;
      if (item && typeof item === 'object' && !Array.isArray(item)) flatten(item, path, out);
      else out[path] = Array.isArray(item) ? item.join(', ') : item == null ? '' : String(item);
    }
    return out;
  }

  // Fort Worth's CRM uses nested additional fields; the email renderer expects
  // these answers in its documented guest-facing groups. Keep CRM requests intact.
  function guestFields(fields) {
    if (location.hostname !== 'fortworthsecondchanceapartments.com') return fields;
    const selectNames = {
      'preferences.bedrooms': 'bedrooms', 'preferences.budget': 'budget',
      'preferences.area': 'areaPreference', 'financial.creditScore': 'creditRange',
      'rentalHistory.rentalIssues': 'rentalIssue', 'rentalHistory.brokenLease': 'brokenLeaseAge',
      'rentalHistory.brokenLeaseDebt': 'brokenLeaseDebt', 'rentalHistory.eviction': 'evictionAge',
      'rentalHistory.evictionDebt': 'evictionDebt', 'rentalHistory.propertyDebt': 'propertyDebt',
      'background.backgroundIssues': 'backgroundIssue', 'background.felonyDetails': 'felonyDetail',
      'background.misdemeanorDetails': 'misdemeanorDetail'
    };
    for (const [field, name] of Object.entries(selectNames)) {
      const control = submittedForm?.elements.namedItem(name);
      if (control?.tagName === 'SELECT' && fields[field] && fields[field] === control.value) {
        fields[field] = control.selectedOptions[0].textContent.trim();
      }
    }
    const aliases = {
      'additional.priorities': 'preferences.topPriorities',
      'additional.activeDebtPlan': 'rentalHistory.activeDebtPlan',
      'additional.pets': 'preferences.pets',
      'additional.situation': 'rentalHistory.rentalIssues',
      'preferences.details': 'preferences.notes'
    };
    for (const [source, target] of Object.entries(aliases)) {
      if (!fields[source]) continue;
      fields[target] = fields[target] && fields[target] !== fields[source]
        ? fields[target] + '\n' + fields[source] : fields[source];
      delete fields[source];
    }
    // A calculator result is part of the renter's request, not just form metadata.
    if (fields['formMetadata.calculatorResult']) {
      fields['preferences.notes'] = [fields['preferences.notes'], fields['formMetadata.calculatorResult']].filter(Boolean).join('\n');
    }
    return fields;
  }

  async function save(payload) {
    const body = JSON.stringify(payload);
    if (new TextEncoder().encode(body).length > 48000) throw new Error('Guest-card copy exceeds storage limit');
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await originalFetch('https://guestcards.austinsecondchanceapartments.com/api/guest-cards', {
          // text/plain is a CORS-safelisted type: avoid a preflight delaying page-exit delivery.
          method: 'POST', headers: {'Content-Type': 'text/plain;charset=UTF-8'},
          body, keepalive: true, credentials: 'omit', redirect: 'error'
        });
        if (response.ok) {
          const result = await response.clone().json();
          if (result.saved !== true || result.id !== payload.id) throw new Error('Missing database receipt');
          window.dispatchEvent(new CustomEvent('sca:guest-card-saved', {detail: {id: payload.id}}));
          return response;
        }
        if (response.status < 500 && response.status !== 429) return response;
      } catch (_) { /* Retry the same receipt, never create a second record. */ }
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt));
    }
    window.dispatchEvent(new CustomEvent('sca:guest-card-copy-failed', {detail: {id: payload.id}}));
    throw new Error('Guest-card copy could not be confirmed');
  }

  window.fetch = function (input, init) {
    let url;
    try { url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href); }
    catch (_) { return originalFetch(input, init); }
    // Only the known guest-card FormSubmit endpoint changes. CRM and contact-form calls pass through intact.
    if (url.origin !== 'https://formsubmit.co' || url.pathname !== '/ajax/' + key || url.search || url.hash) {
      return originalFetch(input, init);
    }
    const method = (init?.method || input?.method || 'GET').toUpperCase();
    if (method !== 'POST') return originalFetch(input, init);
    const snapshot = {id: crypto.randomUUID(), sourceUrl: location.href, clientSubmittedAt: new Date().toISOString(),
      clientLoadedAt: loadedAt, collectorVersion: '1', consent: consentSnapshot()};
    return (async function () {
      const body = init?.body !== undefined ? init.body : await input.clone().text();
      return save({...snapshot, fields: guestFields(fieldsFrom(body))});
    })();
  };
})();
