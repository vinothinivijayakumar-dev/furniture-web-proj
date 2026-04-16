// Variables 
const mainContent = document.getElementById('main-content');
const sections = mainContent.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");
let header = document.querySelector('header');
let scrolltop = document.querySelector('.scroll-top');
let menu = document.querySelector('.menu-icon');
let navbar = document.querySelector('.navbar');

// NAV HIGHLIGHT 
const updateNavHighlight = () => {
  if (mainContent.style.display === 'none') {
    navLinks.forEach(link => link.classList.remove("active"));
    return;
  }

  const scrollY = window.scrollY;
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 300; // ← increased offset
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => link.classList.remove("active"));

  if (current) {
    const activeLink = document.querySelector(`.nav-link[href="#${current}"]`);
    if (activeLink) activeLink.classList.add("active");
  }

  if (scrollY < 200) {
    navLinks.forEach(link => link.classList.remove("active"));
    const homeLink = document.querySelector('.nav-link[href="#home"]');
    if (homeLink) homeLink.classList.add("active");
  }
};

// PAGE SWITCHING 
const showPage = (pageEl) => {
  mainContent.style.display = 'none';
  document.querySelectorAll('.page-overlay').forEach(p => p.classList.remove('active'));
  pageEl.classList.add('active');
  document.body.style.overflow = 'auto'; // ← ensure body scrolls
  window.scrollTo(0, 0);
  initNewsletterForms();
  navLinks.forEach(link => link.classList.remove("active"));

  if (pageEl === wishlistPage) localStorage.setItem('activePage', 'wishlist');
  else if (pageEl === cartTab) localStorage.setItem('activePage', 'cart');
  else if (pageEl === checkoutPage) localStorage.setItem('activePage', 'checkout');
  else if (pageEl.id === 'login-page') localStorage.setItem('activePage', 'login');
};

const hidePage = () => {
  document.querySelectorAll('.page-overlay').forEach(p => p.classList.remove('active'));
  mainContent.style.display = 'block';
  document.body.style.overflow = 'auto'; // ← ensure body scrolls
  localStorage.setItem('activePage', 'main');
  setTimeout(() => updateNavHighlight(), 100);
};

// SINGLE SCROLL LISTENER 
window.addEventListener("scroll", () => {
  if (mainContent.style.display !== 'none') {
    localStorage.setItem('scrollPos', window.scrollY);
  }

  // No condition — works on ALL pages
  header.classList.toggle('shadow', window.scrollY > 0);
  scrolltop.classList.toggle('active', window.scrollY > 0);

  navbar.classList.remove('active');
  menu.classList.remove('move');

  updateNavHighlight();
});

// NAVBAR + MENU 
// MENU TOGGLE
menu.onclick = () => {
  navbar.classList.toggle('active');
  menu.classList.toggle('move');
};

// USER ICON (LOGIN PAGE)
document.querySelector('#user-icon').onclick = (e) => {
  e.preventDefault();
  const loginPage = document.getElementById('login-page');

  if (loginPage.classList.contains('active')) {
    hidePage();
  } else {
    showPage(loginPage);
  }

  // CLOSE MENU
  navbar.classList.remove('active');
  menu.classList.remove('move');
};

// NAVBAR LINK CLICK FIX
document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');

    if (targetId.startsWith("#")) {
      e.preventDefault();

      const targetSection = document.querySelector(targetId);

      // CLOSE MENU FIRST
      navbar.classList.remove('active');
      menu.classList.remove('move');

      // SMALL DELAY → IMPORTANT
      setTimeout(() => {
        targetSection.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);
    }
  });
});

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !navbar.contains(e.target)) {
    navbar.classList.remove('active');
    menu.classList.remove('move');
  }
});

// HOME IMAGE ANIMATION, LOAD EVENT
window.addEventListener("load", () => {
  const homeImg = document.querySelector(".home-img");
  if (homeImg) homeImg.classList.add("show");

  updateWishlist();
  updateCart();

  const activePage = localStorage.getItem('activePage');

  if (activePage === 'wishlist') {
    showPage(wishlistPage);
  } else if (activePage === 'cart') {
    showPage(cartTab);
  } else if (activePage === 'checkout') {
    loadOrderSummary(); // ← restore summary before showing page
    showPage(checkoutPage);
  } else if (activePage === 'login') {
    showPage(document.getElementById('login-page'));
  } else {
    hidePage();
    const savedScroll = localStorage.getItem('scrollPos');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
        setTimeout(() => updateNavHighlight(), 100);
      }, 50);
    }
  }
});

// ABOUT ANIMATION 
const aboutSection = document.querySelector('.about');
const aboutImage = document.querySelector('.about-img');

const observerAbout = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      aboutSection.classList.add('show');
      aboutImage.classList.add('show');
    }
  });
}, { threshold: 0.3 });

observerAbout.observe(aboutSection);

// SMOOTH SCROLL 
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);

    // Manually set the active link immediately on click
    navLinks.forEach(l => l.classList.remove("active"));
    this.classList.add("active");

    hidePage();
    setTimeout(() => {
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  });
});

document.querySelector(".scroll-top").addEventListener("click", (e) => {
  e.preventDefault();
  // Check if any overlay is active
  const activePage = document.querySelector('.page-overlay.active');
  if (activePage) {
    activePage.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// LOGO CLICK 
document.querySelector('.logo').addEventListener('click', (e) => {
  e.preventDefault();
  hidePage();
  window.scrollTo(0, 0);
});

// SHOP NOW BUTTON 
document.querySelector('.shop-btn').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

// WISHLIST 
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let wishlistIcon = document.querySelector('#wishlist-icon');
let wishlistPage = document.querySelector('#wishlist-page');
let closeWishlist = document.querySelector('#closeWishlist');
let wishlistListEl = document.querySelector('#wishlist-list');
let wishlistValueEl = document.querySelector('.wishlist-value');

const saveWishlist = () => localStorage.setItem('wishlist', JSON.stringify(wishlist));

wishlistIcon.addEventListener('click', (e) => {
  e.preventDefault();
  showPage(wishlistPage);
});

closeWishlist.addEventListener('click', (e) => {
  e.preventDefault();
  hidePage();
});

const updateWishlist = () => {
  saveWishlist();
  wishlistListEl.innerHTML = '';
  wishlistValueEl.textContent = wishlist.length;

  const totalBox = document.querySelector('.wishlist-total-box');

  if (wishlist.length === 0) {
    wishlistListEl.innerHTML = `
      <div class="empty-wishlist-box">
        <img src="./images/wishlist-Empty.png" alt="Empty Wishlist">
        <p class="empty-wishlist">Nothing here yet, add your favorites.</p>
        <a href="#" class="btn start-shopping-btn">Start Shopping</a>
      </div>
    `;
    document.querySelector('.start-shopping-btn').addEventListener('click', (e) => {
      e.preventDefault();
      hidePage();
      setTimeout(() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' }), 50);
    });
    totalBox.style.display = 'none';
    return;
  }

  totalBox.style.display = 'flex';
  let total = 0;
  wishlist.forEach(item => total += parseFloat(item.price.replace('$', '')) * item.quantity);
  document.querySelector('.wishlist-total-amount').textContent = `$${total.toFixed(2)}`;

  wishlist.forEach(item => {
    let el = document.createElement('div');
    el.classList.add('wishlist-item');
    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="wishlist-item-info">
        <h3>${item.name}</h3>
        <span class="price">${item.price}</span>
        <div class="wishlist-qty">
          <a href="#" class="wl-decrease" data-id="${item.id}"><i class='bx bxs-minus-circle'></i></a>
          <span class="wl-qty-value">${item.quantity}</span>
          <a href="#" class="wl-increase" data-id="${item.id}"><i class='bx bxs-plus-circle'></i></a>
        </div>
      </div>
      <div class="wishlist-item-actions">
        <button class="remove-wishlist-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    wishlistListEl.appendChild(el);
  });

  document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wishlist = wishlist.filter(w => String(w.id) !== String(btn.dataset.id));
      updateWishlist(); syncHeartIcons();
    });
  });

  document.querySelectorAll('.wl-decrease').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      let item = wishlist.find(w => String(w.id) === String(btn.dataset.id));
      if (!item) return;
      if (item.quantity > 1) item.quantity--;
      else { wishlist = wishlist.filter(w => String(w.id) !== String(btn.dataset.id)); syncHeartIcons(); }
      updateWishlist();
    });
  });

  document.querySelectorAll('.wl-increase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      let item = wishlist.find(w => String(w.id) === String(btn.dataset.id));
      if (item) item.quantity++;
      updateWishlist();
    });
  });
};

const syncHeartIcons = () => {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    let id = parseInt(btn.dataset.id);
    let inWishlist = wishlist.find(w => w.id === id);
    let icon = btn.querySelector('i');
    icon.classList.toggle('bxs-heart', !!inWishlist);
    icon.classList.toggle('bx-heart', !inWishlist);
    icon.style.color = inWishlist ? 'white' : '';
  });
  document.querySelectorAll('.popular-wishlist-btn').forEach(btn => {
    let inWishlist = wishlist.find(w => String(w.id) === String(btn.dataset.id));
    let icon = btn.querySelector('i');
    icon.classList.toggle('bxs-heart', !!inWishlist);
    icon.classList.toggle('bx-heart', !inWishlist);
    icon.style.color = inWishlist ? 'white' : '';
  });
};

document.querySelectorAll('.popular-wishlist-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    let item = { id: btn.dataset.id, name: btn.dataset.name, price: btn.dataset.price, image: btn.dataset.image, quantity: 1 };
    let exists = wishlist.find(w => String(w.id) === String(item.id));
    if (!exists) wishlist.push(item);
    else wishlist = wishlist.filter(w => String(w.id) !== String(item.id));
    updateWishlist(); syncHeartIcons();
  });
});

// CART 
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let cartIcon = document.querySelector('#cart-icon');
let cartTab = document.querySelector('.cart-tab');
let closeCart = document.querySelector('#closeCart');
let cartListEl = document.querySelector('.cart-list');
let cartTotalEl = document.querySelector('.cart-total');
let cartValueEl = document.querySelector('#cart-icon .cart-value');

const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));

cartIcon.addEventListener("click", (e) => {
  e.preventDefault();
  showPage(cartTab);
});

closeCart.addEventListener("click", (e) => {
  e.preventDefault();
  hidePage();
});

const addToCart = (id, itemData = null) => {
  let item = itemData || productList.find(p => p.id === id);
  if (!item) return;
  let exists = cart.find(c => String(c.id) === String(id));
  if (!exists) cart.push({ ...item, quantity: 1 });
  else cart = cart.filter(c => String(c.id) !== String(id));
  updateCart(); syncCartIcons();
};

const updateCart = () => {
  saveCart();
  cartListEl.innerHTML = "";
  let total = 0, count = 0;
  const cartBottom = document.querySelector('.cart-bottom');

  if (cart.length === 0) {
    cartListEl.innerHTML = `
      <div class="empty-cart-box">
        <img src="./images/Empty-cart.png" alt="Empty Cart">
        <p class="empty-cart">No items yet, start shopping now</p>
        <a href="#" class="btn start-shopping-btn-cart">Start Shopping</a>
      </div>
    `;
    document.querySelector('.start-shopping-btn-cart').addEventListener('click', (e) => {
      e.preventDefault();
      hidePage();
      setTimeout(() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' }), 50);
    });
    cartTotalEl.textContent = '$0.00';
    cartValueEl.textContent = 0;
    cartBottom.style.display = 'none';
    return;
  }

  cartBottom.style.display = 'flex';

  cart.forEach(item => {
    total += parseFloat(item.price.replace('$', '')) * item.quantity;
    count += item.quantity;
    let cartItem = document.createElement("div");
    cartItem.classList.add("item");
    cartItem.innerHTML = `
      <div class="item-image"><img src="${item.image}" alt="${item.name}"></div>
      <div class="item-details">
        <h4>${item.name}</h4>
        <span class="item-price">${item.price}</span>
        <div class="item-stars">
        <i class='bx bxs-star'></i>
        <i class='bx bxs-star'></i>
        <i class='bx bxs-star'></i>
        <i class='bx bxs-star'></i>
        <i class='bx bxs-star-half'></i>
        </div>
        <div class="item-qty">
          <a href="#" class="decrease" data-id="${item.id}"><i class='bx bxs-minus-circle'></i></a>
          <span class="quantity-value">${item.quantity}</span>
          <a href="#" class="increase" data-id="${item.id}"><i class='bx bxs-plus-circle'></i></a>
        </div>
      </div>
      <div class="item-actions">
      <button class="remove-cart-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartListEl.appendChild(cartItem);
  });

  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  cartValueEl.textContent = count;

  document.querySelectorAll('.remove-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cart = cart.filter(c => String(c.id) !== String(btn.dataset.id));
      updateCart(); syncCartIcons();
    });
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let item = cart.find(c => String(c.id) === String(btn.dataset.id));
      if (!item) return;
      if (item.quantity > 1) item.quantity--;
      else { cart = cart.filter(c => String(c.id) !== String(btn.dataset.id)); syncCartIcons(); }
      updateCart();
    });
  });

  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let item = cart.find(c => String(c.id) === String(btn.dataset.id));
      if (item) item.quantity++;
      updateCart();
    });
  });
};

const syncCartIcons = () => {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    let id = parseInt(btn.dataset.id);
    let inCart = cart.find(c => c.id === id);
    let icon = btn.querySelector('i');
    icon.classList.toggle('bxs-cart-alt', !!inCart);
    icon.classList.toggle('bx-cart-alt', !inCart);
  });
  document.querySelectorAll('.popular-cart-btn').forEach(btn => {
    let inCart = cart.find(c => String(c.id) === String(btn.dataset.id));
    let icon = btn.querySelector('i');
    icon.classList.toggle('bxs-cart-alt', !!inCart);
    icon.classList.toggle('bx-cart-alt', !inCart);
  });
};

// PRODUCTS 
let productList = [];
const productsContainer = document.querySelector('.products-content');

const showCards = () => {
  productsContainer.innerHTML = "";
  productList.forEach(product => {
    const box = document.createElement("div");
    box.classList.add("box");
    box.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="box-text">
        <div class="title-price"><h3>${product.name}</h3><span>${product.price}</span></div>
        <div class="icons">
          <a href="#" class="wishlist-btn" data-id="${product.id}"><i class='bx bx-heart'></i></a>
          <a href="#" class="add-to-cart" data-id="${product.id}"><i class='bx bx-cart-alt'></i></a>
        </div>
      </div>
    `;
    productsContainer.appendChild(box);
  });

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => { e.preventDefault(); addToCart(parseInt(btn.dataset.id)); });
  });

  document.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let id = parseInt(btn.dataset.id);
      let exists = wishlist.find(w => w.id === id);
      if (!exists) addToWishlist(id);
      else { wishlist = wishlist.filter(w => w.id !== id); updateWishlist(); }
      syncHeartIcons();
    });
  });

  syncHeartIcons();
  syncCartIcons();
};

const addToWishlist = (id) => {
  let item = productList.find(p => p.id === id);
  if (!item) return;
  let exists = wishlist.find(w => w.id === id);
  if (!exists) wishlist.push({ ...item, quantity: 1 });
  updateWishlist();
};

const initApp = () => {
  fetch('products.json').then(r => r.json()).then(data => { productList = data; showCards(); });
};
initApp();

// POPULAR SECTION CART 
document.querySelectorAll('.popular-cart-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    addToCart(btn.dataset.id, { id: btn.dataset.id, name: btn.dataset.name, price: btn.dataset.price, image: btn.dataset.image });
  });
});

// SAVE ORDER SUMMARY 
const loadOrderSummary = () => {
  const summaryItems = document.getElementById('summary-items');
  const summaryTotal = document.getElementById('summary-total');
  summaryItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const itemTotal = parseFloat(item.price.replace('$', '')) * item.quantity;
    total += itemTotal;
    summaryItems.innerHTML += `
      <div class="summary-item">
        <div class="summary-item-left">
          <img src="${item.image}" alt="${item.name}">
          <div><h4>${item.name}</h4><span>Qty: ${item.quantity}</span></div>
        </div>
        <span class="summary-item-price">$${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });
  summaryTotal.textContent = `$${total.toFixed(2)}`;
};

// CHECKOUT 
const checkoutPage = document.querySelector('#checkout-page');
const closeCheckout = document.querySelector('#closeCheckout');
const checkoutBtn = document.querySelector('.checkout-btn');
const placeOrderBtn = document.querySelector('#place-order-btn');
const successPopup = document.querySelector('#order-success-popup');
const successCloseBtn = document.querySelector('#success-close-btn');

checkoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (cart.length === 0) return;
  loadOrderSummary();
  showPage(checkoutPage);
});

closeCheckout.addEventListener('click', (e) => {
  e.preventDefault();
  hidePage();
});

document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('upi-input-box').style.display = radio.value === 'upi' && radio.checked ? 'block' : 'none';
  });
});

placeOrderBtn.addEventListener('click', () => {
  const name = document.getElementById('co-name');
  const email = document.getElementById('co-email');
  const phone = document.getElementById('co-phone');
  const address = document.getElementById('co-address');
  const upi = document.getElementById('co-upi');
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  let valid = true;

  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

  if (!name.value.trim()) {
    document.getElementById('err-name').textContent = 'Full name is required.';
    name.classList.add('input-error'); valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    document.getElementById('err-email').textContent = 'Email is required.';
    email.classList.add('input-error'); valid = false;
  }
  else if (!emailRegex.test(email.value.trim())) {
    document.getElementById('err-email').textContent = 'Please enter a valid email address.';
    email.classList.add('input-error'); valid = false;
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phone.value.trim()) {
    document.getElementById('err-phone').textContent = 'Phone number is required.';
    phone.classList.add('input-error'); valid = false;
  }
  else if (!phoneRegex.test(phone.value.trim())) {
    document.getElementById('err-phone').textContent = 'Enter a valid 10-digit phone number.';
    phone.classList.add('input-error'); valid = false;
  }

  if (!address.value.trim()) {
    document.getElementById('err-address').textContent = 'Delivery address is required.';
    address.classList.add('input-error'); valid = false;
  }

  if (paymentMethod === 'upi') {
    const upiRegex = /^[\w.\-]{3,}@[a-zA-Z]{3,}$/;
    if (!upi.value.trim()) {
      document.getElementById('err-upi').textContent = 'UPI ID is required.';
      upi.classList.add('input-error'); valid = false;
    }
    else if (!upiRegex.test(upi.value.trim())) {
      document.getElementById('err-upi').textContent = 'Enter a valid UPI ID (e.g. name@upi).';
      upi.classList.add('input-error'); valid = false;
    }
  }

  if (!valid) return;

  document.body.style.overflow = 'hidden';
  const processingOverlay = document.createElement('div');
  processingOverlay.id = 'processing-overlay';
  processingOverlay.innerHTML = `<div class="processing-box"><div class="spinner"></div><p>Processing your order...</p><span>Please wait, don't close this page.</span></div>`;
  document.body.appendChild(processingOverlay);

  setTimeout(() => {
    processingOverlay.remove();
    document.body.style.overflow = 'auto';
    cart = []; saveCart(); updateCart(); syncCartIcons();
    hidePage();
    successPopup.classList.add('active');
    ['co-name', 'co-email', 'co-phone', 'co-address', 'co-upi'].forEach(id => document.getElementById(id).value = '');
  }, 2500);
});

successCloseBtn.addEventListener('click', () => {
  successPopup.classList.remove('active');
  setTimeout(() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' }), 50);
});

// CONTACT FORM 
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById('contact-name');
  const email = document.getElementById('contact-email');
  const message = document.getElementById('contact-message');
  let valid = true;

  document.querySelectorAll('.contact-error').forEach(el => el.remove());
  document.querySelectorAll('.contact-input-error').forEach(el => el.classList.remove('contact-input-error'));

  if (!name.value.trim()) { showContactError(name, 'Name is required.'); valid = false; }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) { showContactError(email, 'Email is required.'); valid = false; }
  else if (!emailRegex.test(email.value.trim())) { showContactError(email, 'Please enter a valid email address.'); valid = false; }
  if (!message.value.trim()) { showContactError(message, 'Message is required.'); valid = false; }
  if (!valid) return;
  this.reset();
  showContactSuccess();
});

const showContactError = (input, msg) => {
  input.classList.add('contact-input-error');
  const err = document.createElement('span');
  err.classList.add('contact-error');
  err.textContent = msg;
  input.parentNode.insertBefore(err, input.nextSibling);
};

const showContactSuccess = () => {
  const existing = document.getElementById('contact-success-popup');
  if (existing) existing.remove();
  const popup = document.createElement('div');
  popup.id = 'contact-success-popup';
  popup.innerHTML = `<div class="contact-success-box"><i class='bx bxs-check-circle'></i>
  <h3>Message Sent!</h3>
  <p>Thank you for reaching out. We'll get back to you soon.</p>
  <button id="contact-success-close">OK</button></div>`;
  document.body.appendChild(popup);
  document.getElementById('contact-success-close').addEventListener('click', () => popup.remove());
  setTimeout(() => { if (document.getElementById('contact-success-popup')) popup.remove(); }, 4000);
};

// NEWSLETTER 
const initNewsletterForms = () => {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('.newsletter-email-input');
      const msg = this.querySelector('.newsletter-msg');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      msg.className = 'newsletter-msg';
      msg.textContent = '';
      if (!emailInput.value.trim()) { msg.textContent = 'Please enter your email.'; msg.classList.add('newsletter-error'); return; }
      if (!emailRegex.test(emailInput.value.trim())) { msg.textContent = 'Please enter a valid email address.'; msg.classList.add('newsletter-error'); return; }
      this.reset();
      msg.textContent = 'Subscribed successfully!';
      msg.classList.add('newsletter-success');
      setTimeout(() => { msg.textContent = ''; msg.className = 'newsletter-msg'; }, 4000);
    });
  });
};

initNewsletterForms();

// LOGIN FORM 
//Close Function
const closeLogin = document.getElementById("closeLogin");
const loginPage = document.getElementById("login-page");

closeLogin.addEventListener("click", (e) => {
  e.preventDefault();

  loginPage.classList.remove("active");   // close login
  mainContent.style.display = "block";    // show home page
});

//opening login page, hide home
const userIcon = document.getElementById("user-icon");

userIcon.addEventListener("click", (e) => {
  e.preventDefault();

  loginPage.classList.add("active");   // open login
  mainContent.style.display = "none";  // hide home
});

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  let valid = true;

  // Clear errors
  document.getElementById('err-login-email').textContent = '';
  document.getElementById('err-login-password').textContent = '';
  email.classList.remove('input-error');
  password.classList.remove('input-error');

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    document.getElementById('err-login-email').textContent = 'Email is required.';
    email.classList.add('input-error');
    valid = false;
  } else if (!emailRegex.test(email.value.trim())) {
    document.getElementById('err-login-email').textContent = 'Please enter a valid email.';
    email.classList.add('input-error');
    valid = false;
  }

  // Validate password
  if (!password.value.trim()) {
    document.getElementById('err-login-password').textContent = 'Password is required.';
    password.classList.add('input-error');
    valid = false;
  } else if (password.value.trim().length < 6) {
    document.getElementById('err-login-password').textContent = 'Password must be at least 6 characters.';
    password.classList.add('input-error');
    valid = false;
  }

  if (!valid) return;

  // SUCCESS — show popup then go to home
  const popup = document.createElement('div');
  popup.id = 'login-success-popup';
  popup.innerHTML = `
    <div class="contact-success-box">
      <i class='bx bxs-check-circle'></i>
      <h3>Login Successful!</h3>
      <p>Welcome back! Taking you to the home page.</p>
    </div>
  `;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
    this.reset();
    hidePage();
    window.scrollTo(0, 0);
  }, 2000);
});