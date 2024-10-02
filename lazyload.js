// Select the container where item cards are displayed
const itemContainer = document.querySelector('.mobile-container');

// Select all item cards
const allItemCards = Array.from(document.querySelectorAll('forge-card'));

// Number of items to load at a time
const itemsPerLoad = 10;

// Current index of loaded items
let currentIndex = 0;

// Function to show a batch of items
function showItems() {
  const fragment = document.createDocumentFragment();
  const endIndex = Math.min(currentIndex + itemsPerLoad, allItemCards.length);

  for (let i = currentIndex; i < endIndex; i++) {
    fragment.appendChild(allItemCards[i]);
  }

  itemContainer.appendChild(fragment);
  currentIndex = endIndex;

  // Hide the loading indicator if all items are loaded
  if (currentIndex >= allItemCards.length) {
    loadingIndicator.style.display = 'none';
  }
}

// Create a loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.textContent = 'Loading more items...';
loadingIndicator.style.textAlign = 'center';
loadingIndicator.style.padding = '20px';
loadingIndicator.style.display = 'none';
itemContainer.appendChild(loadingIndicator);

// Function to check if we need to load more items
function checkScroll() {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.offsetHeight;

  if (pageHeight - scrollPosition < 200 && currentIndex < allItemCards.length) {
    loadingIndicator.style.display = 'block';
    // Use setTimeout to simulate network delay (remove in production)
    setTimeout(showItems, 500);
  }
}

// Initial load
showItems();

// Add scroll event listener
window.addEventListener('scroll', checkScroll);


// Event listener for search input
const searchInput = document.querySelector('forge-text-field.search input');
searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    // Reset to initial state
    itemContainer.innerHTML = '';
    currentIndex = 0;
    showItems();
  } else {
    filterItems(searchTerm);
  }
});