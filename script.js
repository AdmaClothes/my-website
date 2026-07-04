document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const product = button.dataset.product;
      alert(`${product} added to cart!`);
    });
  });

  const form = document.getElementById('newsletter-form');
  const message = document.getElementById('form-message');

  form.addEventListener('submit', event => {
    event.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (email) {
      message.textContent = 'Thanks! You are subscribed.';
      form.reset();
    } else {
      message.textContent = 'Please enter a valid email address.';
    }
  });
});
