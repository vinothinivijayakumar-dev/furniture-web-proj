document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

let menu = document.querySelector('.menu-icon');
let navbar = document.querySelector('.navbar');
let login = document.querySelector('.login-form');
let cartIcon = document.querySelector('#cart-icon');
let cartTab = document.querySelector('.cart-tab');
let closeCart = document.querySelector('#closeCart');
let cartListEl = document.querySelector('.cart-list');
let cartTotalEl = document.querySelector('.cart-total');
let cartValueEl = document.querySelector('.cart-value');

menu.onclick = () => {
  navbar.classList.toggle('active');
  menu.classList.toggle('move');
  login.classList.remove('active');
};

document.querySelector('#user-icon').onclick = () => {
  login.classList.toggle('active');
  navbar.classList.remove('active');
  menu.classList.remove('move');
};

window.onscroll = () => {
  navbar.classList.remove('active');
  menu.classList.remove('move');
};

let header = document.querySelector('header');
let scrolltop = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
  header.classList.toggle('shadow', window.scrollY > 0);
  scrolltop.classList.toggle('active', window.scrollY > 0);
});

let cart = [];

cartIcon.addEventListener("click", () => {
  cartTab.classList.add("cart-tab-active");
  document.body.classList.add("cart-open");
});

closeCart.addEventListener("click", () => {
  cartTab.classList.remove("cart-tab-active");
  document.body.classList.remove("cart-open");
});

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
        <div class="title-price">
          <h3>${product.name}</h3>
          <span>${product.price}</span>
        </div>
        <a href="#" class="add-to-cart" data-id="${product.id}">
          <i class='bx bx-cart-alt'></i>
        </a>
      </div>
    `;
    productsContainer.appendChild(box);
  });

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let id = parseInt(btn.dataset.id);
      addToCart(id);
    });
  });
};

const addToCart = (id) => {
  let item = productList.find(p => p.id === id);
  let cartItem = cart.find(c => c.id === id);

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({...item, quantity: 1});
  }
  updateCart();
};

const updateCart = () => {
  cartListEl.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += parseFloat(item.price.replace('$', '')) * item.quantity;
    count += item.quantity;

    let cartItem = document.createElement("div");
    cartItem.classList.add("item");
    cartItem.innerHTML = `
      <div class="item-image">
        <img src="${item.image}">
      </div>
      <div>
        <h4>${item.name}</h4>
        <h4 class="item-total">$${(parseFloat(item.price.replace('$','')) * item.quantity).toFixed(2)}</h4>
      </div>
      <div class="flex">
        <a href="#" class="quantity-btn decrease" data-id="${item.id}">
          <i class='bx bxs-minus-circle'></i>
        </a>
        <h4 class="quantity-value">${item.quantity}</h4>
        <a href="#" class="quantity-btn increase" data-id="${item.id}">
          <i class='bx bxs-plus-circle'></i>
        </a>
      </div>
    `;
    cartListEl.appendChild(cartItem);
  });

  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  cartValueEl.textContent = count;

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let id = parseInt(btn.dataset.id);
      decreaseQuantity(id);
    });
  });

  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let id = parseInt(btn.dataset.id);
      increaseQuantity(id);
    });
  });
};

const decreaseQuantity = (id) => {
  let item = cart.find(c => c.id === id);
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart = cart.filter(c => c.id !== id);
  }
  updateCart();
};

const increaseQuantity = (id) => {
  let item = cart.find(c => c.id === id);
  item.quantity++;
  updateCart();
};

const initApp = () => {
  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      productList = data;
      showCards();
    });
};

initApp();
