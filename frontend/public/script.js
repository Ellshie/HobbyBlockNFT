// script.js
console.log("script.js loaded!");

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            alert("Connected to: " + accounts[0]);
        } catch (error) {
            console.error("Connection failed:", error);
        }
    } else {
        alert("MetaMask not detected. Please install it.");
    }
}

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Get all filter tags
    const filterTags = document.querySelectorAll('.filter-tag');
    
    // Add data-category attributes to all collection cards
    setupCollectionCategories();
    
    // Add click event listener to each filter tag
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tag
            this.classList.add('active');
            
            // Get the category from the tag text content
            const category = this.textContent.trim();
            
            // Filter collections based on category
            filterCollections(category);
        });
    });
    
    // Also add event listener to the dropdown filter
    const categoryDropdown = document.querySelector('.filter-dropdown');
    if (categoryDropdown) {
        categoryDropdown.addEventListener('change', function() {
            const category = this.value;
            
            // Update the active filter tag to match the dropdown selection
            filterTags.forEach(tag => {
                if (tag.textContent.trim() === category || 
                   (category === 'All Categories' && tag.textContent.trim() === 'All')) {
                    tag.classList.add('active');
                } else {
                    tag.classList.remove('active');
                }
            });
            
            // Filter collections based on selected category
            filterCollections(category === 'All Categories' ? 'All' : category);
        });
    }
});

// Function to set up data categories for each collection card
function setupCollectionCategories() {
    const collections = document.querySelectorAll('.collection-card');
    
    collections.forEach(collection => {
        const title = collection.querySelector('h3').textContent.trim().toLowerCase();
        
        // Assign appropriate categories based on collection title or add direct data attributes in your HTML
        if (title.includes('dreamscapes') || title.includes('genesis') || title.includes('abstract') || title.includes('cosmos')) {
            collection.setAttribute('data-category', 'Art');
        } else if (title.includes('sonic') || title.includes('harmony')) {
            collection.setAttribute('data-category', 'Music');
        } else if (title.includes('ethereal') || title.includes('moments')) {
            collection.setAttribute('data-category', 'Photography');
        } else if (title.includes('legend') || title.includes('series')) {
            collection.setAttribute('data-category', 'Sports');
        } else if (title.includes('pixel') || title.includes('skull')) {
            collection.setAttribute('data-category', 'Collectibles');
        } else {
            collection.setAttribute('data-category', 'Other');
        }
        
        // You can add multiple categories separated by spaces if needed
        // Example: collection.setAttribute('data-category', 'Art Music');
    });
}

// Function to filter collections based on selected category
function filterCollections(category) {
    const collections = document.querySelectorAll('.collection-card');
    
    collections.forEach(collection => {
        // Get the collection's category
        const collectionCategory = collection.getAttribute('data-category');
        
        // Show all collections if 'All' is selected, otherwise show only matching categories
        if (category === 'All' || collectionCategory.includes(category)) {
            collection.style.display = 'block';
            // Optional animation for appearing items
            collection.style.opacity = '0';
            setTimeout(() => {
                collection.style.transition = 'opacity 0.3s ease';
                collection.style.opacity = '1';
            }, 10);
        } else {
            collection.style.display = 'none';
        }
    });
}