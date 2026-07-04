document.addEventListener('DOMContentLoaded', () => {
  const cart = [];
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');
  const cartCountBanner = document.getElementById('cart-count-banner');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutButton = document.getElementById('checkout-button');
  const viewCartButton = document.getElementById('view-cart-button');
  const checkoutModal = document.getElementById('checkout-modal');
  const modalClose = document.getElementById('modal-close');
  const paymentForm = document.getElementById('payment-form');
  const paymentMessage = document.getElementById('payment-message');
  const modalTotal = document.getElementById('modal-total');
  const paypalButtonsContainer = document.getElementById('paypal-button-container');
  const addMessage = document.getElementById('cart-banner-note');

  const formatPrice = value => `$${value.toFixed(2)}`;

  const createPayPalOrder = (actions, total) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: total.toFixed(2)
          }
        }
      ]
    });
  };

  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalButtonsContainer) return;
    paypalButtonsContainer.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'black',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: (_, actions) => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return createPayPalOrder(actions, total);
      },
      onApprove: (_, actions) => {
        return actions.order.capture().then(details => {
          paymentMessage.textContent = `Payment complete! Thank you, ${details.payer.name.given_name}.`;
          cart.length = 0;
          updateCartUI();
          checkoutButton.disabled = true;
          paypalButtonsContainer.innerHTML = '<p class="paypal-success">Payment completed via PayPal.</p>';
        });
      },
      onError: err => {
        paymentMessage.textContent = 'PayPal could not complete the payment. Please try again.';
        console.error(err);
      }
    }).render('#paypal-button-container');
  };

  const updateCartUI = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = itemCount;
    if (cartCountBanner) cartCountBanner.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
    cartTotal.textContent = formatPrice(total);
    modalTotal.textContent = total.toFixed(2);

    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
      checkoutButton.disabled = true;
      if (paypalButtonsContainer) paypalButtonsContainer.innerHTML = '';
      return;
    }

    checkoutButton.disabled = false;
    cartItems.innerHTML = '';

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <p>${item.quantity} × ${formatPrice(item.price)}</p>
        </div>
        <button data-product="${item.name}" class="remove-item">Remove</button>
      `;
      cartItems.appendChild(row);
    });

    cartItems.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', () => {
        const product = button.dataset.product;
        const index = cart.findIndex(item => item.name === product);
        if (index !== -1) {
          cart.splice(index, 1);
          updateCartUI();
        }
      });
    });

    renderPayPalButtons();
  };

  const addToCart = (name, price) => {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
    if (addMessage) {
      addMessage.textContent = `Added ${name} to your cart.`;
      setTimeout(() => {
        addMessage.textContent = 'Add items and click “View cart & pay” to see the checkout section.';
      }, 2500);
    }
  };

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.product;
      const price = Number(button.dataset.price || 0);
      addToCart(name, price);
    });
  });

  cartButton.addEventListener('click', () => {
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
  });

  if (viewCartButton) {
    viewCartButton.addEventListener('click', () => {
      document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
    });
  }

  checkoutButton.addEventListener('click', () => {
    checkoutModal.classList.remove('hidden');
    checkoutModal.setAttribute('aria-hidden', 'false');
    paymentMessage.textContent = '';
  });

  modalClose.addEventListener('click', () => {
    checkoutModal.classList.add('hidden');
    checkoutModal.setAttribute('aria-hidden', 'true');
  });

  paymentForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(paymentForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const card = formData.get('card');
    const expiry = formData.get('expiry');

    if (!name || !email || !card || !expiry) {
      paymentMessage.textContent = 'Please complete all payment fields.';
      return;
    }

    paymentMessage.textContent = 'Processing payment...';
    setTimeout(() => {
      paymentMessage.textContent = `Payment complete! Thank you, ${name}.`;
      cart.length = 0;
      updateCartUI();
      paymentForm.reset();
      checkoutButton.disabled = true;
    }, 1200);
  });

  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterMessage = document.getElementById('form-message');
  newsletterForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    if (email) {
      newsletterMessage.textContent = 'Thanks! You are subscribed.';
      newsletterForm.reset();
    } else {
      newsletterMessage.textContent = 'Please enter a valid email address.';
    }
  });

  updateCartUI();
});
