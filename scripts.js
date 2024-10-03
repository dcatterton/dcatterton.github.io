// Existing code...

// Function to show the Item Detail dialog
function showItemDetailDialog(card) {
  const itemId = card.querySelector('.forge-typography--label2').textContent.split('#')[1];
  const itemName = card.querySelector('.forge-typography--subheading1').textContent;
  const itemPrice = card.querySelector('.forge-typography--heading2').textContent;
  const itemImage = card.querySelector('img').src;
  const itemDescription = "Item description placeholder"; // You may need to add this to your HTML or fetch it from somewhere

  const dialog = document.querySelector('forge-dialog[trigger="open-dialog9"]');
  
  // Update dialog content
  dialog.querySelector('.productImgLg').src = itemImage;
  dialog.querySelector('.forge-typography--subheading2').textContent = itemName;
  dialog.querySelector('.forge-typography--subheading1').textContent = itemDescription;
  dialog.querySelector('.priceDesc').textContent = itemPrice;
  
  // Set up quantity select and add to cart button
  const quantitySelect = dialog.querySelector('.quantity');
  const addToCartButton = dialog.querySelector('.addToCart');
  
  quantitySelect.value = '1'; // Reset quantity to 1
  
  addToCartButton.onclick = () => {
    addToCartFromDialog(itemId, itemName, parseFloat(itemPrice.replace('$', '')), itemImage, parseInt(quantitySelect.value));
    dialog.removeAttribute('open');
  };

  // Show the dialog
  dialog.setAttribute('open', '');
}

// Function to add item to cart from the Item Detail dialog
function addToCartFromDialog(itemId, itemName, itemPrice, itemImage, quantity) {
  const itemData = {
    id: itemId,
    name: itemName,
    price: itemPrice,
    image: itemImage,
    quantity: quantity
  };

  const existingItemIndex = cartItems.findIndex(item => item.id === itemData.id);
  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    cartItems.push(itemData);
  }

  updateBadge();
  updateCartDialog();
  showItemAddedDialog(itemData);
  saveCartData();
}

// Modify the existing addToCart function to work with both card buttons and dialog
function addToCart(button) {
  const card = button.closest('forge-card');
  const itemId = card.querySelector('.forge-typography--label2').textContent.split('#')[1];
  const itemName = card.querySelector('.forge-typography--subheading1').textContent;
  const itemPrice = parseFloat(card.querySelector('.forge-typography--heading2').textContent.replace('$', ''));
  const itemImage = card.querySelector('img').src;
  const quantitySelect = card.querySelector('.quantity');
  const selectedQuantity = parseInt(quantitySelect.value);

  addToCartFromDialog(itemId, itemName, itemPrice, itemImage, selectedQuantity);
  
  // Reset quantity select to 1
  quantitySelect.value = '1';
}

// Update event listeners for item cards
document.querySelectorAll('forge-card').forEach(card => {
  const imageItemCost = card.querySelector('.imageItemCost');
  if (imageItemCost) {
    imageItemCost.addEventListener('click', () => showItemDetailDialog(card));
  }

  const addToCartButton = card.querySelector('.addToCart');
  if (addToCartButton) {
    addToCartButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent the card click event from firing
      addToCart(addToCartButton);
    });
  }
});

// Function to show the Item Added Dialog
function showItemAddedDialog(item) {
  const dialog = document.createElement('forge-dialog');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.setAttribute('aria-describedby', 'dialog-message');
  dialog.setAttribute('fullscreen-threshold', '0');
  dialog.setAttribute('placement', 'center');
  dialog.setAttribute('preset', 'bottom-sheet');
  dialog.setAttribute('mode', 'modal');

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

  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.remove());
  dialog.querySelector('.continue-shopping').addEventListener('click', () => dialog.remove());
  dialog.querySelector('.checkoutBtn').addEventListener('click', () => {
    dialog.remove();
    window.location.href = '/checkout.html';
  });

  dialog.setAttribute('open', '');
}

// Make sure to call loadCartData() when the page loads
document.addEventListener('DOMContentLoaded', loadCartData);
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
function addToCart(button, quantity = 0) {
  const card = button.closest('forge-card');
  const itemData = {
    id: card.querySelector('.forge-typography--label2').textContent.split('#')[1],
    name: card.querySelector('.forge-typography--subheading1').textContent,
    price: parseFloat(card.querySelector('.forge-typography--heading2').textContent.replace('$', '')),
    image: card.querySelector('img').src,
    quantity: quantity
  };

  const existingItemIndex = cartItems.findIndex(item => item.id === itemData.id);
  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity;
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
            <p class="forge-typography--heading2 green">$${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
        <div class="quantityAddCartDialog">
          <forge-select class="quantity" aria-label="Label" label="Quantity" density="small" floatLabel="true" value="${item.quantity}">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `<forge-option value="${num}"${num === item.quantity ? ' selected' : ''}>${num}</forge-option>`).join('')}
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
    dialog.setAttribute('fullscreen-threshold', '0');
    dialog.setAttribute('placement', 'center');
  dialog.setAttribute('preset', 'bottom-sheet');
  dialog.setAttribute('mode', 'modal');

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
      window.location.href = '/checkout.html'; // Redirect to checkout page
    });
  } else {
    // Update the quantity in the existing dialog
    dialog.querySelector('span[slot="value"]').textContent = item.quantity;
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
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const card = button.closest('forge-card');
    const quantitySelect = card.querySelector('.quantity');
    const selectedQuantity = parseInt(quantitySelect.value);
    
    addToCart(button, selectedQuantity);
    
    // Reset quantity select to 1
    quantitySelect.value = '1';
    
    // Optional: Show a brief animation or feedback
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 200);
  });
});

// Function to save cart data to localStorage
function saveCartData() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Function to load cart data from localStorage
function loadCartData() {
  const savedCartItems = localStorage.getItem('cartItems');
  if (savedCartItems) {
    cartItems = JSON.parse(savedCartItems);
    updateBadge();
    updateCartDialog();
  }
}

// Function to clear all items from the cart
function clearCart() {
  cartItems = [];
  updateBadge();
  updateCartDialog();
  saveCartData();
}

// Initialize
loadCartData();
updateBadge();
updateCartDialog();

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

// Select the filter dialog
const filterDialog = document.querySelector('forge-dialog[trigger="open-dialog2"]');

// Select the close icon, cancel button, and apply filters button
const closeIcon = filterDialog.querySelector('forge-icon-button[aria-label="Close dialog"]');
const cancelButton = filterDialog.querySelector('forge-button[slot="end"][variant="outlined"]');
const applyFiltersButton = filterDialog.querySelector('.checkoutBtn');

// Function to close the filter dialog
function closeFilterDialog() {
  filterDialog.removeAttribute('open');
}

// Add event listeners to close the dialog
closeIcon.addEventListener('click', closeFilterDialog);
cancelButton.addEventListener('click', closeFilterDialog);
applyFiltersButton.addEventListener('click', () => {
  // Apply filters logic here (if any)
  closeFilterDialog();
});

// Prevent default behavior of anchor tags inside buttons
cancelButton.querySelector('a').addEventListener('click', (e) => e.preventDefault());