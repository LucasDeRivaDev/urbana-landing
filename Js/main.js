
    // Menú hamburguesa — abre y cierra el nav en mobile
    function toggleMenu() {
        const nav = document.getElementById('mainNav');
        nav.classList.toggle('open'); // agrega o quita la clase "open"
      }
  
      // Cierra el menú mobile al hacer clic en un link
      document.querySelectorAll('nav a').forEach(function(link) {
        link.addEventListener('click', function() {
          document.getElementById('mainNav').classList.remove('open');
        });
      });
  
      // ======================
      // Carrito de compras
      // ======================
      const cartButton = document.getElementById('cartButton');
      const cartDrawer = document.getElementById('cartDrawer');
      const cartOverlay = document.getElementById('cartOverlay');
      const cartCloseButton = document.getElementById('cartCloseButton');
      const cartItemsEl = document.getElementById('cartItems');
      const cartEmptyStateEl = document.getElementById('cartEmptyState');
      const cartCountEl = document.getElementById('cartCount');
      const cartTotalEl = document.getElementById('cartTotal');
      const cartCheckoutBtn = document.getElementById('cartCheckout');
  
      let cart = [];
      let nextCartItemId = 1;
  
      function formatARS(value) {
        try {
          return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
          }).format(value);
        } catch (e) {
          return '$' + value;
        }
      }
  
      function isCartOpen() {
        return cartDrawer.classList.contains('open');
      }
  
      function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
        cartDrawer.setAttribute('aria-hidden', 'false');
        cartOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
  
      function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
        cartDrawer.setAttribute('aria-hidden', 'true');
        cartOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
  
      function renderCart() {
        const itemCount = cart.reduce((acc, it) => acc + it.qty, 0);
        cartCountEl.textContent = String(itemCount);
        cartCountEl.classList.toggle('hidden', itemCount === 0);
  
        const total = cart.reduce((acc, it) => acc + it.price * it.qty, 0);
        cartTotalEl.textContent = formatARS(total);
        cartCheckoutBtn.disabled = itemCount === 0;
  
        // Limpiar lista
        const existingItems = cartItemsEl.querySelectorAll('.cart-item');
        existingItems.forEach(function(node) { node.remove(); });
  
        if (itemCount === 0) {
          cartEmptyStateEl.style.display = 'block';
          return;
        }
  
        cartEmptyStateEl.style.display = 'none';
  
        cart.forEach(function(item) {
          const row = document.createElement('div');
          row.className = 'cart-item';
          row.innerHTML = `
            <div class="cart-item-left">
              <div class="cart-item-name">${item.name}<span class="cart-qty">× ${item.qty}</span></div>
              <div class="cart-item-price">${formatARS(item.price * item.qty)}</div>
            </div>
            <div class="cart-item-right">
              <div class="cart-qty-controls">
                <button class="cart-qty-btn" type="button" aria-label="Agregar uno" data-cart-id="${item.id}" data-cart-action="inc">+</button>
                <button class="cart-qty-btn" type="button" aria-label="Quitar uno" data-cart-id="${item.id}" data-cart-action="dec">−</button>
              </div>
              <button class="cart-remove" type="button" aria-label="Eliminar ${item.name}" data-cart-id="${item.id}">&times;</button>
            </div>
          `;
          cartItemsEl.appendChild(row);
        });
      }
  
      function addToCart(productName, productPrice) {
        const existing = cart.find((it) => it.name === productName && it.price === productPrice);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({
            id: nextCartItemId++,
            name: productName,
            price: productPrice,
            qty: 1
          });
        }
        renderCart();
      }
  
      function adjustCartItemQty(cartItemId, delta) {
        const item = cart.find((it) => String(it.id) === String(cartItemId));
        if (!item) return;
  
        item.qty += delta;
        if (item.qty <= 0) {
          removeCartItem(cartItemId);
          return;
        }
  
        renderCart();
      }
  
      function removeCartItem(cartItemId) {
        cart = cart.filter(function(it) {
          return String(it.id) !== String(cartItemId);
        });
        renderCart();
      }
  
      // Abrir/cerrar drawer
      cartButton.addEventListener('click', function() {
        if (isCartOpen()) closeCart();
        else openCart();
      });
      cartCloseButton.addEventListener('click', closeCart);
      cartOverlay.addEventListener('click', closeCart); // click fuera del panel
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCart();
      });
  
      // Agregar productos
      document.querySelectorAll('.btn-agregar').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const card = btn.closest('.producto-card');
          if (!card) return;
  
          const name = card.dataset.productName;
          const price = parseInt(card.dataset.productPrice || '0', 10);
          if (!name || !price) return;
  
          addToCart(name, price);
          openCart(); // muestra el carrito al agregar
        });
      });
  
      // Eliminar/cambiar cantidad desde el drawer
      cartItemsEl.addEventListener('click', function(e) {
        const target = e.target;
        if (!target || !target.classList) return;
  
        if (target.classList.contains('cart-remove')) {
          const id = target.getAttribute('data-cart-id');
          removeCartItem(id);
          return;
        }
  
        if (target.classList.contains('cart-qty-btn')) {
          const id = target.getAttribute('data-cart-id');
          const action = target.getAttribute('data-cart-action');
          if (!id || !action) return;
  
          if (action === 'inc') adjustCartItemQty(id, 1);
          if (action === 'dec') adjustCartItemQty(id, -1);
        }
      });
  
      // Finalizar compra (demo sin backend)
      cartCheckoutBtn.addEventListener('click', function() {
        if (cart.length === 0) return;
        alert('¡Compra finalizada! (Demo sin backend)');
        cart = [];
        nextCartItemId = 1;
        renderCart();
        closeCart();
      });
  
      // Estado inicial
      renderCart();
  