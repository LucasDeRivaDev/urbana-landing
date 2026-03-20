
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
              <div class="cart-item-size">Talle ${item.size}</div>
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
  
      function addToCart(productName, productPrice, productSize) {
        const existing = cart.find((it) => it.name === productName && it.price === productPrice && it.size === productSize);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({
            id: nextCartItemId++,
            name: productName,
            price: productPrice,
            size: productSize,
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
  
      // Selección de talle por producto
      document.querySelectorAll('.producto-card').forEach(function(card) {
        const errorEl = card.querySelector('.talle-error');
        const sizeButtons = card.querySelectorAll('.talle-btn');

        card.dataset.selectedSize = '';

        sizeButtons.forEach(function(btn) {
          btn.addEventListener('click', function() {
            const selected = btn.dataset.size || '';

            sizeButtons.forEach(function(b) { b.classList.remove('selected'); });
            if (selected) btn.classList.add('selected');

            card.dataset.selectedSize = selected;
            if (errorEl) errorEl.classList.remove('visible');
          });
        });
      });

      // Agregar productos
      document.querySelectorAll('.btn-agregar').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const card = btn.closest('.producto-card');
          if (!card) return;
  
          const name = card.dataset.productName;
          const price = parseInt(card.dataset.productPrice || '0', 10);
          const selectedSize = card.dataset.selectedSize;
          const errorEl = card.querySelector('.talle-error');
          if (!name || !price) return;
  
          if (!selectedSize) {
            if (errorEl) errorEl.classList.add('visible');
            return;
          }

          if (errorEl) errorEl.classList.remove('visible');

          addToCart(name, price, selectedSize);
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

     // ======================
     // Carrusel de productos
      // ======================
    const productosCarousel = document.getElementById('productosCarousel');
      if (productosCarousel) {
        const viewport = document.getElementById('productosCarouselViewport');
        const track = document.getElementById('productosCarouselTrack');
        const prevBtn = document.getElementById('productosCarouselPrev');
        const nextBtn = document.getElementById('productosCarouselNext');
        const dotsWrap = document.getElementById('productosCarouselDots');

        const originalCards = Array.from(track.querySelectorAll('.producto-card'));
        let cardsPerView = 4;
        let currentPage = 0;
        let pages = 1;
        let isAnimating = false;

        function getCardsPerView() {
          if (window.innerWidth <= 720) return 1;
          if (window.innerWidth <= 1024) return 2;
          return 4;
        }

        function getCardWidth() {
          const card = track.querySelector('.producto-card');
          if (!card) return 0;
          const gap = 24;
          return card.offsetWidth + gap;
        }

        function goToPage(page, smooth) {
    if (isAnimating) return;
    isAnimating = true;

    // Loop infinito
    if (page < 0) page = pages - 1;
    if (page >= pages) page = 0;

    currentPage = page;
    const offset = currentPage * cardsPerView * getCardWidth();

    viewport.scrollTo({ left: offset, behavior: smooth ? 'smooth' : 'auto' });

    updateDotsUI();

    setTimeout(function() { isAnimating = false; }, 400);
  }

  function updateDotsUI() {
    if (!dotsWrap) return;
    Array.from(dotsWrap.querySelectorAll('.carousel-dot')).forEach(function(btn, i) {
      const active = i === currentPage;
      btn.classList.toggle('active', active);
      btn.textContent = active ? '•' : '○';
    });
  }

  function buildDotsUI() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Ir a página ' + (i + 1));
      btn.textContent = i === 0 ? '•' : '○';
      btn.addEventListener('click', function() { goToPage(i, true); });
      dotsWrap.appendChild(btn);
    }
  }

  function refreshCarousel() {
    cardsPerView = getCardsPerView();
    productosCarousel.style.setProperty('--carousel-cards-per-view', String(cardsPerView));
    pages = Math.max(1, Math.ceil(originalCards.length / cardsPerView));
    currentPage = 0;

    // Ir al inicio sin animación
    viewport.scrollTo({ left: 0, behavior: 'auto' });

    buildDotsUI();
  }

  prevBtn.addEventListener('click', function() { goToPage(currentPage - 1, true); });
  nextBtn.addEventListener('click', function() { goToPage(currentPage + 1, true); });

  // Las flechas nunca se deshabilitan
  prevBtn.disabled = false;
  nextBtn.disabled = false;

  let resizeTimer = null;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshCarousel, 150);
  });

  refreshCarousel();
};

// ======================
// Animaciones al scroll
// ======================
const fadeEls = document.querySelectorAll(
  '.service-card, .producto-card, .contact-form, .contact-info'
);

fadeEls.forEach(function(el) {
  el.classList.add('fade-in');
});

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // solo anima una vez
    }
  });
}, { threshold: 0.15 });

fadeEls.forEach(function(el) {
  observer.observe(el);
});

// ======================
// Modal de producto
// ======================
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalImagen = document.getElementById('modalImagen');
const modalBadge = document.getElementById('modalBadge');
const modalCategoria = document.getElementById('modalCategoria');
const modalNombre = document.getElementById('modalNombre');
const modalPrecios = document.getElementById('modalPrecios');
const modalTalles = document.getElementById('modalTalles');
const modalTalleError = document.getElementById('modalTalleError');
const modalAgregar = document.getElementById('modalAgregar');

let modalSelectedSize = '';
let modalProductName = '';
let modalProductPrice = 0;

function openModal(card) {
  const name = card.dataset.productName;
  const price = parseInt(card.dataset.productPrice || '0', 10);
  const img = card.querySelector('.producto-imagen');
  const badge = card.querySelector('.producto-badge');
  const categoria = card.querySelector('.producto-categoria');
  const precioActual = card.querySelector('.precio-actual');
  const precioAnterior = card.querySelector('.precio-anterior');

  modalProductName = name;
  modalProductPrice = price;
  modalSelectedSize = '';

  modalImagen.src = img ? img.src : '';
  modalImagen.alt = img ? img.alt : '';

  if (badge) {
    modalBadge.textContent = badge.textContent;
    modalBadge.className = 'modal-badge ' + (badge.classList.contains('nuevo') ? 'nuevo' : 'oferta');
  } else {
    modalBadge.textContent = '';
    modalBadge.className = 'modal-badge';
  }

  modalCategoria.textContent = categoria ? categoria.textContent : '';
  modalNombre.textContent = name;

  modalPrecios.innerHTML = '';
  if (precioActual) {
    const span = document.createElement('span');
    span.className = 'precio-actual';
    span.textContent = precioActual.textContent;
    modalPrecios.appendChild(span);
  }
  if (precioAnterior) {
    const span = document.createElement('span');
    span.className = 'precio-anterior';
    span.textContent = precioAnterior.textContent;
    modalPrecios.appendChild(span);
  }

  // Reset talles
  modalTalles.querySelectorAll('.talle-btn').forEach(function(btn) {
    btn.classList.remove('selected');
  });
  modalTalleError.classList.remove('visible');

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Click en imagen de producto abre modal
document.querySelectorAll('.producto-card .producto-imagen').forEach(function(img) {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', function(e) {
    e.stopPropagation();
    openModal(img.closest('.producto-card'));
  });
});

// Talles en el modal
modalTalles.querySelectorAll('.talle-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    modalTalles.querySelectorAll('.talle-btn').forEach(function(b) {
      b.classList.remove('selected');
    });
    btn.classList.add('selected');
    modalSelectedSize = btn.dataset.size;
    modalTalleError.classList.remove('visible');
  });
});

// Agregar desde modal
modalAgregar.addEventListener('click', function() {
  if (!modalSelectedSize) {
    modalTalleError.classList.add('visible');
    return;
  }
  addToCart(modalProductName, modalProductPrice, modalSelectedSize);
  closeModal();
  openCart();
});

// Cerrar modal
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(e) {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ======================
// Filtro por categoría
// ======================
const filtrosBtns = document.querySelectorAll('.filtro-btn');
const allCards = Array.from(document.querySelectorAll('.producto-card'));

filtrosBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    // Marcar activo
    filtrosBtns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    const filtro = btn.dataset.filtro;

    allCards.forEach(function(card) {
      const categoria = card.querySelector('.producto-categoria');
      if (!categoria) return;

      const match = filtro === 'todos' || categoria.textContent.trim() === filtro;
      card.style.display = match ? '' : 'none';
    });

    // Reiniciar carrusel
    if (typeof refreshCarousel === 'function') refreshCarousel();
  });
});

// ======================
// Wishlist — favoritos
// ======================
let wishlist = JSON.parse(localStorage.getItem('urbana-wishlist') || '[]');

function saveWishlist() {
  localStorage.setItem('urbana-wishlist', JSON.stringify(wishlist));
}

function initWishlistButtons() {
  document.querySelectorAll('.producto-card').forEach(function(card) {
    const btn = card.querySelector('.wishlist-btn');
    if (!btn) return;

    const name = card.dataset.productName;

    // Restaurar estado guardado
    if (wishlist.includes(name)) {
      btn.classList.add('active');
      btn.textContent = '♥';
      btn.setAttribute('aria-label', 'Quitar de favoritos');
    }

    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // no abre el modal
      const inList = wishlist.includes(name);

      if (inList) {
        wishlist = wishlist.filter(function(n) { return n !== name; });
        btn.classList.remove('active');
        btn.textContent = '♡';
        btn.setAttribute('aria-label', 'Agregar a favoritos');
      } else {
        wishlist.push(name);
        btn.classList.add('active');
        btn.textContent = '♥';
        btn.setAttribute('aria-label', 'Quitar de favoritos');
      }

      saveWishlist();
    });
  });
}

initWishlistButtons();