(() => {
  'use strict';

  let state = {
    cart: [],
    currentProduct: null,
    selectedFlavors: [],
    flavorMode: 1,
  };

  const els = {
    productsGrid: document.getElementById('products-grid'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    modalOverlay: document.getElementById('modal-overlay'),
    modal: document.getElementById('product-modal'),
    modalClose: document.getElementById('modal-close'),
    modalCancel: document.getElementById('modal-cancel-btn'),
    modalAdd: document.getElementById('modal-add-btn'),
    modalName: document.getElementById('modal-name'),
    modalDesc: document.getElementById('modal-desc'),
    modalPrice: document.getElementById('modal-price'),
    modalThumb: document.getElementById('modal-thumb'),
    modalOptions: document.getElementById('modal-options'),
    modalFlavors: document.getElementById('modal-flavors'),
    modalFlavorMode: document.getElementById('modal-flavor-mode'),
    modalFlavorHint: document.getElementById('modal-flavor-hint'),
    modalSubtotal: document.getElementById('modal-subtotal'),
    modalExtraLine: document.getElementById('modal-extra-line'),
    modalExtra: document.getElementById('modal-extra'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartClose: document.getElementById('cart-close'),
    cartItems: document.getElementById('cart-items'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartTotal: document.getElementById('cart-total'),
    cartCount: document.getElementById('cart-count'),
    cartClear: document.getElementById('cart-clear'),
    cartCheckout: document.getElementById('cart-checkout'),
    navLinks: document.querySelectorAll('.nav-link'),
    toggleMenu: document.getElementById('toggle-menu'),
    nav: document.getElementById('nav'),
  };

  function getProducts(category) {
    if (category === 'todo') {
      return [
        ...PRODUCTS.pizzas.map((p) => ({ ...p, _cat: 'pizzas' })),
        ...PRODUCTS.platos.map((p) => ({ ...p, _cat: 'platos' })),
        ...PRODUCTS.bebidas.map((p) => ({ ...p, _cat: 'bebidas' })),
      ];
    }
    return (PRODUCTS[category] || []).map((p) => ({ ...p, _cat: category }));
  }

  function renderProducts(category = 'pizzas') {
    els.productsGrid.innerHTML = '';
    const items = getProducts(category);
    items.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-thumb">
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://thebrotherspizza.com.co/assets/image/white.png'">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          <div class="product-price-row">
            <span class="product-price">${formatPrice(product.basePrice)}</span>
            <button class="product-add" data-id="${product.id}" data-cat="${product._cat}">Pedir</button>
          </div>
        </div>
      `;
      els.productsGrid.appendChild(card);
    });

    els.productsGrid.querySelectorAll('.product-add').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const cat = e.currentTarget.dataset.cat;
        openProductModal(id, cat);
      });
    });
  }

  function openProductModal(id, category) {
    const product = PRODUCTS[category].find((p) => p.id === id);
    if (!product) return;

    state.currentProduct = product;
    state.flavorMode = 1;
    state.selectedFlavors = product.flavors && product.flavors.length ? [product.flavors[0]] : [];

    els.modalName.textContent = product.name;
    els.modalDesc.textContent = product.description;
    els.modalPrice.textContent = formatPrice(product.basePrice);
    els.modalThumb.innerHTML = `<img src="${product.image}" alt="${product.name}" onerror="this.src='https://thebrotherspizza.com.co/assets/image/white.png'">`;

    if (product.flavors && product.flavors.length > 0) {
      els.modalOptions.style.display = 'block';
      renderFlavorMode();
      renderFlavors(product.flavors);
    } else {
      els.modalOptions.style.display = 'none';
    }

    updateModalSubtotal();
    openModal();
  }

  function renderFlavorMode() {
    els.modalFlavorMode.querySelectorAll('.mode-btn').forEach((btn) => {
      const active = Number(btn.dataset.mode) === state.flavorMode;
      btn.classList.toggle('mode-btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function updateFlavorHint() {
    if (state.flavorMode === 1) {
      els.modalFlavorHint.textContent = 'Elige 1 sabor para toda la pizza.';
      return;
    }
    const names = state.selectedFlavors.map((f) => f.name);
    const half1 = names[0] ? `Mitad 1: ${names[0]}` : 'Mitad 1: —';
    const half2 = names[1] ? `Mitad 2: ${names[1]}` : 'Mitad 2: elige la otra mitad';
    els.modalFlavorHint.textContent = `${half1}  ·  ${half2}`;
  }

  function renderFlavors(flavors) {
    els.modalFlavors.innerHTML = '';
    flavors.forEach((flavor) => {
      const isSelected = state.selectedFlavors.some((f) => f.name === flavor.name);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `option-chip ${isSelected ? 'option-chip--selected' : ''}`;
      chip.innerHTML = `<span class="chip-name">${flavor.name}</span>${
        flavor.extra > 0 ? `<span class="chip-extra">+${formatPrice(flavor.extra)}</span>` : ''
      }`;
      chip.addEventListener('click', () => toggleFlavor(flavor));
      els.modalFlavors.appendChild(chip);
    });
    updateFlavorHint();
  }

  function toggleFlavor(flavor) {
    const idx = state.selectedFlavors.findIndex((f) => f.name === flavor.name);
    if (state.flavorMode === 1) {
      state.selectedFlavors = [flavor];
    } else if (idx >= 0) {
      state.selectedFlavors.splice(idx, 1);
    } else {
      if (state.selectedFlavors.length >= 2) state.selectedFlavors.shift();
      state.selectedFlavors.push(flavor);
    }
    renderFlavors(state.currentProduct.flavors);
    updateModalSubtotal();
  }

  function setFlavorMode(mode) {
    if (!state.currentProduct) return;
    state.flavorMode = mode;
    if (mode === 1) state.selectedFlavors = state.selectedFlavors.slice(0, 1);
    renderFlavorMode();
    renderFlavors(state.currentProduct.flavors);
    updateModalSubtotal();
  }

  function updateAddButton() {
    const valid = state.flavorMode !== 2 || state.selectedFlavors.length === 2;
    els.modalAdd.disabled = !valid;
    els.modalAdd.classList.toggle('btn--disabled', !valid);
  }

  function updateModalSubtotal() {
    const p = state.currentProduct;
    if (!p) return;
    const extra = state.selectedFlavors.reduce((sum, f) => sum + (f.extra || 0), 0);
    els.modalSubtotal.textContent = formatPrice(p.basePrice + extra);

    if (els.modalExtraLine) {
      els.modalExtraLine.style.display = extra > 0 ? 'flex' : 'none';
      els.modalExtra.textContent = `+${formatPrice(extra)}`;
    }
    updateAddButton();
  }

  function openModal() {
    els.modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    els.modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    state.currentProduct = null;
    state.selectedFlavors = [];
    state.flavorMode = 1;
  }

  els.modalFlavorMode.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFlavorMode(Number(btn.dataset.mode)));
  });

  els.modalClose.addEventListener('click', closeModal);
  els.modalCancel.addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  els.modalAdd.addEventListener('click', () => {
    const p = state.currentProduct;
    if (!p) return;
    if (state.flavorMode === 2 && state.selectedFlavors.length !== 2) return;

    const flavorExtra = state.selectedFlavors.reduce((sum, f) => sum + (f.extra || 0), 0);
    const flavorNames = state.selectedFlavors.map((f) => f.name);
    const total = p.basePrice + flavorExtra;

    const item = {
      id: `${p.id}-${Date.now()}`,
      productId: p.id,
      name: p.name,
      image: p.image,
      category: p.category || 'pizzas',
      flavors: flavorNames,
      flavor: flavorNames.join(' / '),
      flavorExtra,
      qty: 1,
      unitPrice: total,
    };

    state.cart.push(item);
    saveCart();
    renderCart();
    closeModal();
    openCart();
  });

  function saveCart() {
    try { localStorage.setItem('tbp_cart', JSON.stringify(state.cart)); } catch (e) {}
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem('tbp_cart');
      if (raw) state.cart = JSON.parse(raw);
    } catch (e) {}
  }

  function renderCart() {
    els.cartItems.innerHTML = '';
    let subtotal = 0;

    if (state.cart.length === 0) {
      els.cartItems.innerHTML = `<div class="empty-cart"><p>Tu pedido está vacío</p></div>`;
    } else {
      state.cart.forEach((item) => {
        subtotal += item.unitPrice * item.qty;
        const flavorText = item.flavors && item.flavors.length ? item.flavors.join(' / ') : (item.flavor || '');
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <div class="cart-item-thumb"><img src="${item.image}" alt="${item.name}" onerror="this.src='https://thebrotherspizza.com.co/assets/image/white.png'"></div>
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <div class="cart-item-details">
              ${flavorText ? `Sabor: ${flavorText}` : ''}
              ${item.flavorExtra > 0 ? ` · Recargo +${formatPrice(item.flavorExtra)}` : ''}
            </div>
            <span class="cart-item-price">${formatPrice(item.unitPrice)} c/u</span>
            <div class="cart-item-qty">
              <button class="qty-btn" data-id="${item.id}" data-dir="-">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" data-id="${item.id}" data-dir="+">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">Eliminar</button>
          </div>
        `;
        els.cartItems.appendChild(el);
      });
    }

    els.cartSubtotal.textContent = formatPrice(subtotal);
    els.cartTotal.textContent = formatPrice(subtotal);
    els.cartCount.textContent = state.cart.reduce((sum, i) => sum + i.qty, 0);
  }

  els.cartItems.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (btn) {
      const id = btn.dataset.id;
      const dir = btn.dataset.dir;
      const item = state.cart.find((i) => i.id === id);
      if (item) {
        if (dir === '+') item.qty += 1;
        else if (dir === '-' && item.qty > 1) item.qty -= 1;
        saveCart();
        renderCart();
      }
      return;
    }

    const remove = e.target.closest('.remove-item');
    if (remove) {
      const id = remove.dataset.id;
      state.cart = state.cart.filter((i) => i.id !== id);
      saveCart();
      renderCart();
    }
  });

  els.cartClear.addEventListener('click', () => {
    if (!state.cart.length) return;
    if (confirm('¿Vaciar el pedido?')) {
      state.cart = [];
      saveCart();
      renderCart();
    }
  });

  els.cartCheckout.addEventListener('click', () => {
    if (!state.cart.length) {
      alert('Tu pedido está vacío.');
      return;
    }
    const resumen = state.cart
      .map((i) => {
        const ft = i.flavors && i.flavors.length ? i.flavors.join(' / ') : (i.flavor || '');
        return `${i.qty}× ${i.name}${ft ? ' - ' + ft : ''}${i.flavorExtra > 0 ? ` (+${formatPrice(i.flavorExtra)})` : ''}`;
      })
      .join('\n');
    const total = state.cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const mensaje = `🍕 Pedido The Brothers Pizza\n\n${resumen}\n\nTotal: ${formatPrice(total)}\n\nPor favor confirmar disponibilidad y domicilio.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=573100000000&text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  });

  function openCart() {
    els.cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    els.cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  els.cartClose.addEventListener('click', closeCart);
  els.cartDrawer.addEventListener('click', (e) => {
    if (e.target === els.cartDrawer) closeCart();
  });

  document.querySelector('.nav-link--cart').addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  });

  els.navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        els.navLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
        if (els.nav.classList.contains('open')) els.nav.classList.remove('open');
      }
    });
  });

  els.toggleMenu.addEventListener('click', () => {
    const open = els.nav.classList.toggle('open');
    els.toggleMenu.setAttribute('aria-expanded', open);
  });

  els.tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      els.tabBtns.forEach((b) => {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');
      renderProducts(btn.dataset.cat);
    });
  });

  loadCart();
  renderProducts('pizzas');
  renderCart();
})();