// Cart items array to store added products
let cartItems = [];
  
// Select all "Add to cart" buttons
const addToCartButtons = document.querySelectorAll('.addToCart');

// Select the badge element
const badge = document.querySelector('forge-badge[slot="badge"]');

// Select the cart dialog
const cartDialog = document.querySelector('forge-dialog[trigger="open-dialog"]');

// Select the cart dialog body where items will be added
const cartDialogBody = cartDialog.querySelector('#dialog-message');

// Function to update the badge
function updateBadge() {
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  badge.textContent = cartCount;
  badge.removeAttribute('hidden');
}

// Function to close a specific Item Added Dialog
function closeItemAddedDialog(dialog) {
  if (dialog) {
    dialog.removeAttribute('open');
  }
}

// Function to close the Cart Dialog
function closeCartDialog() {
  if (cartDialog) {
    cartDialog.removeAttribute('open');
  }
}

// Function to add item to cart
function addToCart(button) {
  const card = button.closest('forge-card');
  const itemData = {
    id: card.querySelector('.forge-typography--label2').textContent.split('#')[1],
    name: card.querySelector('.forge-typography--subheading1').textContent,
    price: parseFloat(card.querySelector('.forge-typography--heading2').textContent.replace('$', '')),
    image: card.querySelector('img').src,
    quantity: 1
  };

  const existingItemIndex = cartItems.findIndex(item => item.id === itemData.id);
  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity++;
  } else {
    cartItems.push(itemData);
  }

  updateBadge();
  updateCartDialog();
  showItemAddedDialog(itemData);
  saveCartData();
}

// Function to update the cart dialog content
function updateCartDialog() {
  let cartContent = '';
  let subtotal = 0;

  cartItems.forEach(item => {
    subtotal += item.price * item.quantity;
    cartContent += `
      <div class="imageItemCost">
        <img src="${item.image}" class="productImgCart"/>
        <div class="itemCost">
          <p class="forge-typography--subheading1">${item.name}</p>
          <p class="forge-typography--heading2 green">$${item.price.toFixed(2)}</p>
        </div>
      </div>
      <div class="quantityAddCartDialog">
        <forge-select class="quantity" aria-label="Label" label="Quantity" density="small" floatLabel="true" value="${item.quantity}">
          ${[1, 2, 3].map(num => `<forge-option value="${num}"${num === item.quantity ? ' selected' : ''}>${num}</forge-option>`).join('')}
        </forge-select>
        <forge-button variant="text" class="removeFromCart" theme="error" data-id="${item.id}">
          <forge-icon external external-type="extended" name="cart_minus" slot="start"></forge-icon>
          Remove
        </forge-button>
      </div>
    `;
  });

  const shippingFee = 5.95;
  const processingFee = subtotal * 0.04; // 4% of subtotal
  const salesTax = subtotal * 0.09; // Assuming 9% sales tax
  const orderTotal = subtotal + shippingFee + processingFee + salesTax;

  cartContent += `
    <p class="forge-typography--overline">Order summary</p>
    <div class="lineItems">
      <p class="forge-typography--label2">Subtotal</p>
      <p class="forge-typography--subheading1">$${subtotal.toFixed(2)}</p>
    </div>
    <div class="lineItems">
      <p class="forge-typography--label2">Shipping and handling fee</p>
      <p class="forge-typography--subheading1">$${shippingFee.toFixed(2)}</p>
    </div>
    <div class="lineItems">
      <p class="forge-typography--label2">Processing fee</p>
      <p class="forge-typography--subheading1">$${processingFee.toFixed(2)}</p>
    </div>
    <div class="lineItems">
      <p class="forge-typography--label2">Sales tax</p>
      <p class="forge-typography--subheading1">$${salesTax.toFixed(2)}</p>
    </div>
    <div class="grandTotal">
      <p class="forge-typography--heading2">Order total</p>
      <p class="forge-typography--heading3 green">$${orderTotal.toFixed(2)}</p>
    </div>
  `;

  cartDialogBody.innerHTML = cartContent;

  // Add event listeners to new remove buttons
  cartDialogBody.querySelectorAll('.removeFromCart').forEach(button => {
    button.addEventListener('click', () => removeFromCart(button.dataset.id));
  });

  // Add event listeners to quantity selects
  cartDialogBody.querySelectorAll('.quantity').forEach(select => {
    select.addEventListener('change', (event) => updateItemQuantity(event.target));
  });
}

// Function to show the Item Added Dialog for a specific item
function showItemAddedDialog(item) {
  const dialogId = `item-added-dialog-${item.id}`;
  let dialog = document.getElementById(dialogId);

  if (!dialog) {
    // Create a new dialog if it doesn't exist
    dialog = document.createElement('forge-dialog');
    dialog.id = dialogId;
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    dialog.setAttribute('aria-describedby', 'dialog-message');
    dialog.setAttribute('placement', 'center');
    dialog.setAttribute('fullscreen-threshold', '0'); // Add this line to set fullscreen-threshold

    const dialogContent = `
      <forge-scaffold>
        <forge-toolbar slot="header" no-divider>
          <h1 class="forge-typography--heading4" id="dialog-title" slot="start">
            Item added to cart
          </h1>
          <forge-icon-button slot="end" aria-label="Close dialog" class="close-dialog">
            <forge-icon name="close"></forge-icon>
          </forge-icon-button>
        </forge-toolbar>
        <div slot="body" id="dialog-message" style="padding:0 20px 20px 20px;">
          <div style="display: flex; align-items:center; gap: 20px;">
            <img src="${item.image}" class="productImgCart"/>
            <div style="display:flex; flex-direction: column;">
              <p class="forge-typography--label2" style="color:gray; margin-bottom:0px;">Item #${item.id}</p>
              <p class="forge-typography--subheading1" style="margin-bottom: 10px;">${item.name}</p>
              <forge-label-value dense style="margin: 0px;">
                <label slot="label">Quantity</label>
                <span slot="value">${item.quantity}</span>
              </forge-label-value>
            </div>
          </div>
        </div>
        <forge-toolbar slot="footer" no-divider class="footerDialog2">
          <forge-button slot="end" variant="outlined" theme="success" class="continue-shopping">Continue shopping</forge-button>
          <forge-button slot="end" variant="raised" class="checkoutBtn" theme="success">Checkout</forge-button>
        </forge-toolbar>
      </forge-scaffold>
    `;

    dialog.innerHTML = dialogContent;
    document.body.appendChild(dialog);

    // Add event listeners for the new dialog
    dialog.querySelector('.close-dialog').addEventListener('click', () => closeItemAddedDialog(dialog));
    dialog.querySelector('.continue-shopping').addEventListener('click', () => closeItemAddedDialog(dialog));
    dialog.querySelector('.checkoutBtn').addEventListener('click', () => {
      closeItemAddedDialog(dialog);
      // Add your checkout logic here
    });
  }

  // Show the dialog
  dialog.setAttribute('open', '');
}

// Function to remove item from cart
function removeFromCart(itemId) {
  cartItems = cartItems.filter(item => item.id !== itemId);
  updateBadge();
  updateCartDialog();
  saveCartData();
}

// Function to update item quantity
function updateItemQuantity(select) {
  const itemId = select.closest('.quantityAddCartDialog').querySelector('.removeFromCart').dataset.id;
  const newQuantity = parseInt(select.value);
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  if (itemIndex > -1) {
    cartItems[itemIndex].quantity = newQuantity;
    updateBadge();
    updateCartDialog();
    saveCartData();
  }
}

// Add click event listeners to all "Add to cart" buttons
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    addToCart(button);
    
    // Optional: Show a brief animation or feedback
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 200);
  });
});

// Add event listener to close button in the cart dialog
const cartCloseButton = cartDialog.querySelector('forge-icon-button[aria-label="Close dialog"]');
if (cartCloseButton) {
  cartCloseButton.addEventListener('click', closeCartDialog);
}

// Add event listener to the "Continue Shopping" button in the cart dialog
const cartContinueShoppingButton = cartDialog.querySelector('forge-button[slot="end"][variant="outlined"]');
if (cartContinueShoppingButton) {
  cartContinueShoppingButton.addEventListener('click', closeCartDialog);
}

// Initialize the badge and cart dialog on page load
updateBadge();
updateCartDialog();

// Function to save cart data to localStorage
function saveCartData() {
localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function loadCartData() {
const savedCartItems = localStorage.getItem('cartItems');
if (savedCartItems) {
  cartItems = JSON.parse(savedCartItems);
  updateBadge();
  updateCartDialog();
}
}

// Call loadCartData on page load
loadCartData();

// Function to clear all items from the cart
function clearCart() {
cartItems = [];
updateBadge();
updateCartDialog();
saveCartData();
}

// Function to update the cart dialog content
function updateCartDialog() {
let cartContent = '';
let subtotal = 0;

if (cartItems.length === 0) {
  cartContent = `
    <p class="forge-typography--heading4" style="text-align: center; margin: 20px 0;">Your cart is empty</p>
  `;
} else {
  cartItems.forEach(item => {
    subtotal += item.price * item.quantity;
    cartContent += `
      <div class="imageItemCost">
        <img src="${item.image}" class="productImgCart"/>
        <div class="itemCost">
          <p class="forge-typography--subheading1">${item.name}</p>
          <p class="forge-typography--heading2 green">$${item.price.toFixed(2)}</p>
        </div>
      </div>
      <div class="quantityAddCartDialog">
        <forge-select class="quantity" aria-label="Label" label="Quantity" density="small" floatLabel="true" value="${item.quantity}">
          ${[1, 2, 3].map(num => `<forge-option value="${num}"${num === item.quantity ? ' selected' : ''}>${num}</forge-option>`).join('')}
        </forge-select>
        <forge-button variant="text" class="removeFromCart" theme="error" data-id="${item.id}">
          <forge-icon external external-type="extended" name="cart_minus" slot="start"></forge-icon>
          Remove
        </forge-button>
      </div>
    `;
  });

  const shippingFee = 5.95;
  const processingFee = subtotal * 0.04; // 4% of subtotal
  const salesTax = subtotal * 0.09; // Assuming 9% sales tax
  const orderTotal = subtotal + shippingFee + processingFee + salesTax;

  cartContent += `
    <p class="forge-typography--overline">Order summary</p>
    <div class="lineItems">
      <p class="forge-typography--label2">Subtotal</p>
      <p class="forge-typography--subheading1">$${subtotal.toFixed(2)}</p>
    </div>
    <div class="lineItems">
      <p class="forge-typography--label2">Shipping and handling fee</p>
      <p class="forge-typography--subheading1">$${shippingFee.toFixed(2)}</p>
    </div>
    <div class="lineItems">
      <p class="forge-typography--label2">Processing fee</p>
      <p class="forge-typography--subheading1">$${processingFee.toFixed(2)}</p>
    </div>
    <div class="lineItems">
      <p class="forge-typography--label2">Sales tax</p>
      <p class="forge-typography--subheading1">$${salesTax.toFixed(2)}</p>
    </div>
    <div class="grandTotal">
      <p class="forge-typography--heading2">Order total</p>
      <p class="forge-typography--heading3 green">$${orderTotal.toFixed(2)}</p>
    </div>
  `;
}

// Add Clear Cart button
cartContent += `
  <div style="margin-top: 20px;">
    <forge-button variant="outlined" class="clearCart" theme="error" style="width: 100%;">
      <forge-icon external external-type="extended" name="cart_remove" slot="start"></forge-icon>
      Clear Cart
    </forge-button>
  </div>
`;

cartDialogBody.innerHTML = cartContent;

// Add event listeners to new remove buttons
cartDialogBody.querySelectorAll('.removeFromCart').forEach(button => {
  button.addEventListener('click', () => removeFromCart(button.dataset.id));
});

// Add event listeners to quantity selects
cartDialogBody.querySelectorAll('.quantity').forEach(select => {
  select.addEventListener('change', (event) => updateItemQuantity(event.target));
});

// Add event listener to the Clear Cart button
const clearCartButton = cartDialogBody.querySelector('.clearCart');
if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      clearCart();
    }
  });
}
}

// ... (previous code remains the same)

// Select all item cards
const itemCards = document.querySelectorAll('forge-card');

// Select the search input field
const searchInput = document.querySelector('forge-text-field.search input');

// Function to display all items
function displayAllItems() {
itemCards.forEach(card => {
  card.style.display = 'block';
});
}

// Function to filter items based on search input
function filterItems(searchTerm) {
itemCards.forEach(card => {
  const itemName = card.querySelector('.forge-typography--subheading1').textContent.toLowerCase();
  const itemId = card.querySelector('.forge-typography--label2').textContent.toLowerCase();
  
  if (itemName.includes(searchTerm) || itemId.includes(searchTerm)) {
    card.style.display = 'block';
  } else {
    card.style.display = 'none';
  }
});
}

// Event listener for search input
searchInput.addEventListener('input', (event) => {
const searchTerm = event.target.value.toLowerCase().trim();

if (searchTerm === '') {
  displayAllItems();
} else {
  filterItems(searchTerm);
}
});

// Initialize by displaying all items
displayAllItems();

// ... (rest of the code remains the same)


