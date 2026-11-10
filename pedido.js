(() => {
  'use strict';

  const CART_KEY = 'tbp_cart_v1';
  const ORDERS_KEY = 'tbp_orders_v1';
  const STATUS_INTERVAL = 20000;
  const MAX_ORDERS = 12;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const els = {
    viewMenu: $('#view-menu'),
    viewBuilder: $('#view-builder'),
    viewCart: $('#view-cart'),
    viewTracking: $('#view-tracking'),
    filters: $('#filters'),
    pizzaGrid: $('#pizza-grid'),
    productGrid: $('#product-grid'),
    flavorList: $('#flavor-list'),
    cartCount: $('#cart-count'),
    openCart: $('#open-cart'),
    builderBack: $('#builder-back'),
    builderKicker: $('#builder-kicker'),
    builderTitle: $('#builder-title'),
    builderMeta: $('#builder-meta'),
    builderSimple: $('#builder-simple'),
    builderSimpleMedia: $('#builder-simple-media'),
    builderSimpleDesc: $('#builder-simple-desc'),
    builderOptions: $('#builder-options'),
    flavorHint: $('#flavor-hint'),
    flavorChips: $('#flavor-chips'),
    flavorInfo: $('#flavor-info'),
    crustToggle: $('#crust-toggle'),
    crustName: $('#crust-name'),
    crustPrice: $('#crust-price'),
    qty: $('#qty'),
    qtyValue: $('#qty-value'),
    receiptCode: $('#receipt-code'),
    receiptLines: $('#receipt-lines'),
    receiptTotal: $('#receipt-total'),
    builderAdd: $('#builder-add'),
    builderAddMore: $('#builder-add-more'),
    cartBack: $('#cart-back'),
    cartItems: $('#cart-items'),
    cartAddMore: $('#cart-add-more'),
    cartGrid: $('.pedido-cart__grid'),
    checkoutForm: $('#checkout-form'),
    checkoutAside: $('.pedido-cart__checkout'),
    orderType: $('#order-type'),
    payment: $('#payment'),
    paymentNote: $('#payment-note'),
    addressFields: $('#address-fields'),
    cartSubtotal: $('#cart-subtotal'),
    cartTotal: $('#cart-total'),
    trackingMessage: $('#tracking-message'),
    trackingCode: $('#tracking-code'),
    trackingTimeline: $('#tracking-timeline'),
    trackingSummary: $('#tracking-summary'),
    trackingHistory: $('#tracking-history'),
    trackingHistoryList: $('#tracking-history-list'),
    trackingMore: $('#tracking-more'),
    toast: $('#toast'),
  };

  const state = {
    filter: 'pizzas',
    builder: null,
    cart: loadJSON(CART_KEY, []),
    orders: loadJSON(ORDERS_KEY, []),
    activeOrderId: null,
    lastTrackingStatus: null,
    toastTimer: null,
    trackingTimer: null,
  };

  if (!Array.isArray(state.cart)) state.cart = [];
  if (!Array.isArray(state.orders)) state.orders = [];

  state.cart = state.cart.filter((item) => (
    item
    && item.key
    && item.name
    && Number.isFinite(item.unitPrice)
    && Number.isFinite(item.qty)
  ));

  function loadJSON(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }

  function escapeHTML(value) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(value ?? '').replace(/[&<>"']/g, (char) => map[char]);
  }

  function money(value) {
    return formatPrice(Number(value) || 0);
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function fallbackIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 15h7M9 9.5h.01M15 9.5h.01"/></svg>';
  }

  function mediaInner(image, alt) {
    return `${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async">` : ''}<div class="media__fallback">${fallbackIcon()}<span>${escapeHTML(alt)}</span></div>`;
  }

  function mediaMarkup(image, alt, extraClass = '') {
    return `<div class="media ${extraClass}${image ? '' : ' is-fallback'}">${mediaInner(image, alt)}</div>`;
  }

  function fillMedia(container, image, alt) {
    if (!container) return;
    container.innerHTML = mediaInner(image, alt);
    container.classList.toggle('is-fallback', !image);
  }

  function markMediaFallbacks(scope = document) {
    $$('.media img', scope).forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        img.closest('.media')?.classList.add('is-fallback');
      }
    });
  }

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    target.closest('.media')?.classList.add('is-fallback');
  }, true);

  function showToast(message) {
    if (!els.toast) return;
    window.clearTimeout(state.toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => {
      els.toast.classList.remove('is-visible');
    }, 2800);
  }

  function showView(view, updateHash = true) {
    const views = {
      menu: els.viewMenu,
      builder: els.viewBuilder,
      cart: els.viewCart,
      tracking: els.viewTracking,
    };

    Object.entries(views).forEach(([key, element]) => {
      if (element) element.hidden = key !== view;
    });

    if (view !== 'tracking') stopTrackingTimer();
    if (view === 'cart') renderCart();

    if (updateHash) {
      const hashes = {
        menu: '#menu',
        builder: '#arma',
        cart: '#pedido',
        tracking: '#seguimiento',
      };
      try {
        if (window.location.hash !== hashes[view]) {
          window.history.replaceState(null, '', hashes[view]);
        }
      } catch {
        /* ignore history errors */
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function setFilter(filter) {
    state.filter = PRODUCTS[filter] ? filter : 'pizzas';
    $$('.filter-btn', els.filters).forEach((button) => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    renderMenu();
  }

  function menuCard(product) {
    const isPizza = product.kind === 'pizza';
    const action = isPizza
      ? `<button type="button" class="btn btn--red" data-add-pizza="${escapeHTML(product.id)}">Armar</button>`
      : `<button type="button" class="btn btn--red" data-add-product="${escapeHTML(product.id)}">Agregar</button>`;

    return `<article class="menu-card">
      ${mediaMarkup(product.image, product.name, 'menu-card__media')}
      <div class="menu-card__body">
        <p class="menu-card__cat">${escapeHTML(CATEGORY_LABELS[product.category] || product.category)}</p>
        <h3 class="menu-card__name">${escapeHTML(product.name)}</h3>
        <p class="menu-card__desc">${escapeHTML(product.description)}</p>
        <div class="menu-card__foot">
          <span class="menu-card__price">${money(product.basePrice)}</span>
          ${action}
        </div>
      </div>
    </article>`;
  }

  function renderMenu() {
    const isPizza = state.filter === 'pizzas';
    if (els.pizzaGrid) els.pizzaGrid.hidden = !isPizza;
    if (els.productGrid) els.productGrid.hidden = isPizza;

    const grid = isPizza ? els.pizzaGrid : els.productGrid;
    if (!grid) return;
    const products = PRODUCTS[state.filter] || [];
    grid.innerHTML = products.map(menuCard).join('');
    markMediaFallbacks(grid);
  }

  function renderFlavorReference() {
    if (!els.flavorList) return;
    els.flavorList.innerHTML = FLAVORS.map((flavor, index) => {
      const extra = flavor.extra
        ? `<span class="flavor-entry__extra">+${money(flavor.extra)}</span>`
        : '';
      return `<div class="flavor-entry">
        <span class="flavor-entry__num">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <span class="flavor-entry__name">${escapeHTML(flavor.name)}${extra}</span>
          <span class="flavor-entry__desc">${escapeHTML(flavor.desc)}</span>
        </div>
      </div>`;
    }).join('');
  }

  function openBuilder(productId) {
    const product = PRODUCTS.pizzas.find((item) => item.id === productId);
    if (!product) return;

    state.builder = {
      product,
      mode: 1,
      flavors: [],
      crust: false,
      qty: 1,
    };

    if (els.builderKicker) els.builderKicker.textContent = 'ARMAR PIZZA';
    if (els.builderTitle) els.builderTitle.textContent = product.name;
    if (els.builderMeta) {
      els.builderMeta.textContent = `${product.portions} · ${product.diameter} · ${FLAVORS.length} sabores`;
    }
    if (els.builderSimple) els.builderSimple.hidden = false;
    fillMedia(els.builderSimpleMedia, product.image, product.name);
    if (els.builderSimpleDesc) {
      els.builderSimpleDesc.textContent = `${product.description}. Elige uno o dos sabores y mira sus ingredientes aquí mismo.`;
    }
    if (els.builderOptions) els.builderOptions.hidden = false;

    renderBuilder();
    showView('builder');
  }

  function renderBuilder() {
    if (!state.builder) return;
    const builder = state.builder;

    $$('.mode-btn', els.builderOptions).forEach((button) => {
      const active = Number(button.dataset.mode) === builder.mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (els.flavorHint) {
      els.flavorHint.textContent = builder.mode === 1
        ? 'Elige 1 sabor para toda la pizza.'
        : 'Elige 2 sabores, mitad y mitad.';
    }

    renderFlavorChips();
    renderFlavorInfo();
    renderCrust();
    updateReceipt();
  }

  function renderFlavorChips() {
    if (!els.flavorChips || !state.builder) return;
    const selected = state.builder.flavors;
    els.flavorChips.innerHTML = FLAVORS.map((flavor) => {
      const active = selected.includes(flavor.name);
      const extra = flavor.extra
        ? `<span class="chip__extra">+${money(flavor.extra)}</span>`
        : '';
      return `<button type="button" class="chip${active ? ' is-selected' : ''}" data-flavor="${escapeHTML(flavor.name)}" aria-pressed="${active}">
        <span>${escapeHTML(flavor.name)}</span>
        ${extra}
      </button>`;
    }).join('');
  }

  function renderFlavorInfo() {
    if (!els.flavorInfo || !state.builder) return;
    const builder = state.builder;
    if (!builder.flavors.length) {
      els.flavorInfo.innerHTML = `<span class="muted">${builder.mode === 1 ? 'Selecciona un sabor para ver sus ingredientes.' : 'Selecciona dos sabores para ver sus ingredientes.'}</span>`;
      return;
    }

    els.flavorInfo.innerHTML = builder.flavors.map((name) => {
      const flavor = FLAVORS.find((item) => item.name === name);
      if (!flavor) return '';
      const extra = flavor.extra ? ` · +${money(flavor.extra)}` : '';
      return `<div><strong>${escapeHTML(flavor.name)}${extra}</strong><span>${escapeHTML(flavor.desc)}</span></div>`;
    }).join('');
  }

  function renderCrust() {
    if (!els.crustToggle || !state.builder) return;
    const builder = state.builder;
    if (els.crustName) els.crustName.textContent = builder.product.crust.name;
    if (els.crustPrice) els.crustPrice.textContent = money(builder.product.crust.price);
    els.crustToggle.classList.toggle('is-active', builder.crust);
    els.crustToggle.setAttribute('aria-pressed', String(builder.crust));
  }

  function builderUnitPrice() {
    if (!state.builder) return 0;
    const builder = state.builder;
    let unit = builder.product.basePrice;
    builder.flavors.forEach((name) => {
      const flavor = FLAVORS.find((item) => item.name === name);
      if (flavor) unit += flavor.extra;
    });
    if (builder.crust) unit += builder.product.crust.price;
    return unit;
  }

  function builderDetails() {
    if (!state.builder) return '';
    const builder = state.builder;
    const flavors = builder.flavors.length ? builder.flavors.join(' / ') : 'Sin sabor';
    const crust = builder.crust ? builder.product.crust.name : 'Sin borde de queso';
    return `${builder.mode === 1 ? '1 sabor' : '2 sabores'}: ${flavors} · ${crust}`;
  }

  function updateReceipt() {
    if (!state.builder) return;
    const builder = state.builder;
    const unit = builderUnitPrice();

    if (els.receiptCode) {
      els.receiptCode.textContent = `TBP-${builder.product.id.replace('pizza-', '').slice(0, 3).toUpperCase()}`;
    }

    if (els.receiptLines) {
      const flavorLines = builder.flavors.map((name) => {
        const flavor = FLAVORS.find((item) => item.name === name);
        if (!flavor) return '';
        return `<div class="receipt__line"><span>${escapeHTML(name)}</span><span>${flavor.extra ? money(flavor.extra) : 'Incluido'}</span></div>`;
      }).join('');

      els.receiptLines.innerHTML = `
        <div class="receipt__line"><span>${escapeHTML(builder.product.name)}</span><span>${money(builder.product.basePrice)}</span></div>
        ${flavorLines}
        ${builder.crust ? `<div class="receipt__line"><span>${escapeHTML(builder.product.crust.name)}</span><span>${money(builder.product.crust.price)}</span></div>` : ''}
        <div class="receipt__line"><span>Cantidad</span><span>${builder.qty}</span></div>
      `;
    }

    if (els.qtyValue) els.qtyValue.textContent = String(builder.qty);
    if (els.receiptTotal) els.receiptTotal.textContent = money(unit * builder.qty);
  }

  function addToCart(item) {
    const existing = state.cart.find((cartItem) => cartItem.signature === item.signature);
    if (existing) {
      existing.qty += item.qty;
    } else {
      state.cart.push({ ...item, key: uid() });
    }
    saveJSON(CART_KEY, state.cart);
    renderCart();
  }

  function addProduct(productId) {
    const product = Object.values(PRODUCTS).flat().find((item) => item.id === productId);
    if (!product) return;
    addToCart({
      signature: `product:${product.id}`,
      type: 'product',
      productId: product.id,
      name: product.name,
      details: product.description,
      image: product.image,
      unitPrice: product.basePrice,
      qty: 1,
    });
    showToast(`${product.name} agregado al pedido.`);
  }

  function addBuilderToCart() {
    if (!state.builder) return false;
    const builder = state.builder;

    if (builder.flavors.length < builder.mode) {
      showToast(builder.mode === 1 ? 'Elige un sabor para tu pizza.' : 'Elige dos sabores para tu pizza.');
      return false;
    }

    const sortedFlavors = [...builder.flavors].sort();
    addToCart({
      signature: `pizza:${builder.product.id}:${sortedFlavors.join('|')}:${builder.crust ? 'crust' : 'no-crust'}`,
      type: 'pizza',
      productId: builder.product.id,
      name: builder.product.name,
      details: builderDetails(),
      image: builder.product.image,
      unitPrice: builderUnitPrice(),
      qty: builder.qty,
    });
    return true;
  }

  function cartSubtotal() {
    return state.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }

  function cartCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartItemMarkup(item) {
    return `<article class="cart-item">
      <div class="cart-item__thumb media${item.image ? '' : ' is-fallback'}">
        ${mediaInner(item.image, item.name)}
      </div>
      <div class="cart-item__info">
        <h3 class="cart-item__name">${escapeHTML(item.name)}</h3>
        <p class="cart-item__details">${escapeHTML(item.details)}</p>
        <div class="cart-item__row">
          <span class="cart-item__price">${money(item.unitPrice * item.qty)}</span>
          <div class="qty">
            <button type="button" class="qty__btn" data-cart-dir="-1" data-key="${escapeHTML(item.key)}" aria-label="Menos ${escapeHTML(item.name)}">−</button>
            <span class="qty__value">${item.qty}</span>
            <button type="button" class="qty__btn" data-cart-dir="1" data-key="${escapeHTML(item.key)}" aria-label="Más ${escapeHTML(item.name)}">+</button>
          </div>
        </div>
        <button type="button" class="remove-btn" data-cart-remove="${escapeHTML(item.key)}">Quitar</button>
      </div>
    </article>`;
  }

  function renderCart() {
    const count = cartCount();
    const subtotal = cartSubtotal();
    const empty = state.cart.length === 0;

    if (els.cartCount) els.cartCount.textContent = String(count);
    if (els.cartSubtotal) els.cartSubtotal.textContent = money(subtotal);
    if (els.cartTotal) els.cartTotal.textContent = money(subtotal);

    if (els.checkoutForm) els.checkoutForm.hidden = empty;
    if (els.checkoutAside) els.checkoutAside.hidden = empty;
    if (els.cartGrid) els.cartGrid.classList.toggle('is-empty', empty);

    if (!els.cartItems) return;

    if (empty) {
      els.cartItems.innerHTML = `<div class="cart__empty">
        <span class="cart__empty-num">00</span>
        <p class="cart__empty-title">Tu pedido está vacío</p>
        <p class="fineprint">Arma una pizza o agrega algo de la carta.</p>
      </div>`;
      return;
    }

    els.cartItems.innerHTML = state.cart.map(cartItemMarkup).join('');
    markMediaFallbacks(els.cartItems);
  }

  function changeCartQty(key, delta) {
    const item = state.cart.find((cartItem) => cartItem.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      state.cart = state.cart.filter((cartItem) => cartItem.key !== key);
    }
    saveJSON(CART_KEY, state.cart);
    renderCart();
  }

  function removeCartItem(key) {
    state.cart = state.cart.filter((item) => item.key !== key);
    saveJSON(CART_KEY, state.cart);
    renderCart();
    showToast('Producto quitado del pedido.');
  }

  function syncCheckoutFields() {
    if (!els.checkoutForm) return;
    const isDelivery = els.orderType?.value === 'Domicilio';
    if (els.addressFields) els.addressFields.hidden = !isDelivery;

    const address = els.checkoutForm.elements.namedItem('address');
    const neighborhood = els.checkoutForm.elements.namedItem('neighborhood');
    if (address) address.required = isDelivery;
    if (neighborhood) neighborhood.required = isDelivery;
    if (els.paymentNote) els.paymentNote.hidden = els.payment?.value !== 'Transferencia';
  }

  function generateOrderId() {
    const stamp = String(Date.now()).slice(-6);
    const suffix = String(Math.floor(Math.random() * 90) + 10);
    return `TBP-${stamp}${suffix}`;
  }

  function placeOrder(event) {
    event.preventDefault();
    if (!els.checkoutForm) return;

    if (!state.cart.length) {
      showToast('Tu pedido está vacío.');
      showView('menu');
      return;
    }

    syncCheckoutFields();
    if (!els.checkoutForm.reportValidity()) return;

    const data = Object.fromEntries(new FormData(els.checkoutForm).entries());
    const order = {
      id: generateOrderId(),
      createdAt: Date.now(),
      items: state.cart.map((item) => ({ ...item })),
      total: cartSubtotal(),
      customer: {
        name: String(data.name || '').trim(),
        phone: String(data.phone || '').trim(),
      },
      orderType: String(data.orderType || 'Domicilio'),
      sede: String(data.sede || ''),
      address: String(data.address || '').trim(),
      neighborhood: String(data.neighborhood || '').trim(),
      reference: String(data.reference || '').trim(),
      payment: String(data.payment || 'Efectivo'),
      notes: String(data.notes || '').trim(),
    };

    state.orders.unshift(order);
    state.orders = state.orders.slice(0, MAX_ORDERS);
    saveJSON(ORDERS_KEY, state.orders);

    state.cart = [];
    saveJSON(CART_KEY, state.cart);
    renderCart();

    els.checkoutForm.reset();
    syncCheckoutFields();
    showTracking(order.id);
  }

  function getStatusIndex(order) {
    const created = Number(order.createdAt);
    if (!Number.isFinite(created)) return 0;
    const elapsed = Date.now() - created;
    return Math.max(0, Math.min(3, Math.floor(elapsed / STATUS_INTERVAL)));
  }

  function getTrackingSteps(order) {
    const pickup = order.orderType === 'Recoger en la base';
    return [
      { title: 'Pedido recibido', desc: 'Tu pedido entró a la órbita.' },
      { title: 'En preparación', desc: 'La cocina está armando tu pedido.' },
      pickup
        ? { title: 'Listo para recoger', desc: `Pasa por la sede ${order.sede}.` }
        : { title: 'En camino', desc: 'Tu pedido va hacia la dirección indicada.' },
      pickup
        ? { title: 'Recogido', desc: '¡Buen provecho!' }
        : { title: 'Entregado', desc: '¡Buen provecho!' },
    ];
  }

  function formatDate(timestamp) {
    const date = new Date(Number(timestamp));
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function renderTracking(order) {
    if (!order) return;
    const statusIndex = getStatusIndex(order);
    state.lastTrackingStatus = statusIndex;
    const steps = getTrackingSteps(order);

    if (els.trackingMessage) {
      els.trackingMessage.textContent = 'Pedido realizado. Hazle seguimiento en esta sección o pide algo más.';
    }
    if (els.trackingCode) els.trackingCode.textContent = order.id;

    if (els.trackingTimeline) {
      els.trackingTimeline.innerHTML = steps.map((step, index) => {
        const done = index <= statusIndex;
        const current = index === statusIndex;
        return `<div class="tracking__step${done ? ' is-done' : ''}${current ? ' is-current' : ''}">
          <span class="tracking__dot">${done ? '✓' : String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3>${escapeHTML(step.title)}</h3>
            <p>${escapeHTML(step.desc)}</p>
          </div>
        </div>`;
      }).join('');
    }

    if (els.trackingSummary) {
      const customer = order.customer || {};
      const items = order.items || [];
      const itemLines = items.map((item) => `<div class="cart__line"><span>${item.qty}× ${escapeHTML(item.name)}</span><span>${money(item.unitPrice * item.qty)}</span></div>`).join('');
      const address = order.orderType === 'Domicilio'
        ? `<p>${escapeHTML(order.address)}${order.neighborhood ? `, ${escapeHTML(order.neighborhood)}` : ''}</p>`
        : '';
      const reference = order.reference ? `<p>Ref: ${escapeHTML(order.reference)}</p>` : '';
      const notes = order.notes ? `<p>Notas: ${escapeHTML(order.notes)}</p>` : '';

      els.trackingSummary.innerHTML = `<h3>Resumen</h3>
        ${itemLines}
        <div class="cart__line cart__line--total"><span>Total</span><span>${money(order.total)}</span></div>
        <div class="tracking__customer">
          <p><strong>${escapeHTML(customer.name)}</strong> · ${escapeHTML(customer.phone)}</p>
          <p>${escapeHTML(order.sede)} · ${escapeHTML(order.orderType)}</p>
          ${address}
          ${reference}
          <p>Pago: ${escapeHTML(order.payment)}</p>
          ${notes}
        </div>`;
    }

    renderTrackingHistory(order.id);
  }

  function renderTrackingHistory(activeId) {
    if (!els.trackingHistory || !els.trackingHistoryList) return;
    if (state.orders.length <= 1) {
      els.trackingHistory.hidden = true;
      return;
    }

    els.trackingHistory.hidden = false;
    els.trackingHistoryList.innerHTML = state.orders.map((order) => {
      const status = getTrackingSteps(order)[getStatusIndex(order)].title;
      return `<button type="button" class="tracking-history-btn${order.id === activeId ? ' is-active' : ''}" data-order-id="${escapeHTML(order.id)}">
        <span class="tracking-history-btn__code">${escapeHTML(order.id)}</span>
        <span class="tracking-history-btn__status">${escapeHTML(status)}</span>
        <span class="tracking-history-btn__meta">${escapeHTML(formatDate(order.createdAt))} · ${money(order.total)}</span>
      </button>`;
    }).join('');
  }

  function startTrackingTimer() {
    stopTrackingTimer();
    state.trackingTimer = window.setInterval(() => {
      if (!els.viewTracking || els.viewTracking.hidden) return;
      const order = state.orders.find((item) => item.id === state.activeOrderId);
      if (!order) return;
      const status = getStatusIndex(order);
      if (status !== state.lastTrackingStatus) renderTracking(order);
      if (status >= 3) stopTrackingTimer();
    }, 5000);
  }

  function stopTrackingTimer() {
    if (state.trackingTimer) {
      window.clearInterval(state.trackingTimer);
      state.trackingTimer = null;
    }
  }

  function showTracking(orderId) {
    const order = state.orders.find((item) => item.id === orderId) || state.orders[0];
    if (!order) {
      showView('menu');
      return;
    }
    state.activeOrderId = order.id;
    renderTracking(order);
    showView('tracking');
    startTrackingTimer();
  }

  function routeFromHash() {
    const hash = window.location.hash.replace('#', '');
    if ((hash === 'seguimiento' || hash === 'tracking') && state.orders[0]) {
      showTracking(state.orders[0].id);
      return;
    }
    if (hash === 'pedido' || hash === 'cart') {
      showView('cart', false);
      return;
    }
    showView('menu', false);
  }

  function bindEvents() {
    els.filters?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      setFilter(button.dataset.filter);
    });

    [els.pizzaGrid, els.productGrid].forEach((grid) => {
      grid?.addEventListener('click', (event) => {
        const pizzaButton = event.target.closest('[data-add-pizza]');
        if (pizzaButton) {
          openBuilder(pizzaButton.dataset.addPizza);
          return;
        }
        const productButton = event.target.closest('[data-add-product]');
        if (productButton) addProduct(productButton.dataset.addProduct);
      });
    });

    els.openCart?.addEventListener('click', () => showView('cart'));
    els.builderBack?.addEventListener('click', () => {
      setFilter('pizzas');
      showView('menu');
    });
    els.cartBack?.addEventListener('click', () => showView('menu'));
    els.cartAddMore?.addEventListener('click', () => {
      setFilter('pizzas');
      showView('menu');
    });

    els.builderOptions?.addEventListener('click', (event) => {
      const modeButton = event.target.closest('.mode-btn');
      if (!modeButton || !state.builder) return;
      const mode = Number(modeButton.dataset.mode);
      if (mode === state.builder.mode) return;
      state.builder.mode = mode;
      if (state.builder.flavors.length > mode) {
        state.builder.flavors = state.builder.flavors.slice(0, mode);
      }
      renderBuilder();
    });

    els.flavorChips?.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-flavor]');
      if (!chip || !state.builder) return;
      const name = chip.dataset.flavor;
      const builder = state.builder;

      if (builder.flavors.includes(name)) {
        builder.flavors = builder.flavors.filter((flavor) => flavor !== name);
      } else if (builder.flavors.length < builder.mode) {
        builder.flavors.push(name);
      } else {
        showToast(builder.mode === 1
          ? 'Ya elegiste el sabor. Cambia a dos sabores para combinarlo.'
          : 'Ya elegiste 2 sabores. Quita uno para cambiar.');
        return;
      }

      renderBuilder();
    });

    els.crustToggle?.addEventListener('click', () => {
      if (!state.builder) return;
      state.builder.crust = !state.builder.crust;
      renderBuilder();
    });

    els.qty?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-dir]');
      if (!button || !state.builder) return;
      const next = state.builder.qty + Number(button.dataset.dir);
      state.builder.qty = Math.max(1, Math.min(20, next));
      updateReceipt();
    });

    els.builderAdd?.addEventListener('click', () => {
      if (!addBuilderToCart()) return;
      showToast('Pizza agregada al pedido.');
      showView('cart');
    });

    els.builderAddMore?.addEventListener('click', () => {
      if (!addBuilderToCart()) return;
      showToast('Pizza agregada. Elige algo más.');
      setFilter('pizzas');
      showView('menu');
    });

    els.cartItems?.addEventListener('click', (event) => {
      const directionButton = event.target.closest('[data-cart-dir]');
      if (directionButton) {
        changeCartQty(directionButton.dataset.key, Number(directionButton.dataset.cartDir));
        return;
      }
      const removeButton = event.target.closest('[data-cart-remove]');
      if (removeButton) removeCartItem(removeButton.dataset.cartRemove);
    });

    els.orderType?.addEventListener('change', syncCheckoutFields);
    els.payment?.addEventListener('change', syncCheckoutFields);
    els.checkoutForm?.addEventListener('submit', placeOrder);

    els.trackingMore?.addEventListener('click', () => {
      setFilter('pizzas');
      showView('menu');
      showToast('Empieza un pedido nuevo. El anterior sigue en seguimiento.');
    });

    els.trackingHistoryList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-order-id]');
      if (!button) return;
      const order = state.orders.find((item) => item.id === button.dataset.orderId);
      if (!order) return;
      state.activeOrderId = order.id;
      renderTracking(order);
      startTrackingTimer();
    });

    window.addEventListener('hashchange', routeFromHash);
  }

  function init() {
    renderFlavorReference();
    renderMenu();
    renderCart();
    syncCheckoutFields();
    bindEvents();
    routeFromHash();
  }

  init();
})();
