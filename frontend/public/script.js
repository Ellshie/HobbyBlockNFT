console.log("script.js loaded!");

// Global variables
let walletAddress = null;
const walletConnectButtons = document.querySelectorAll('.wallet-connect');

// Connect to MetaMask wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            walletAddress = accounts[0];
            
            // Update all wallet connect buttons
            walletConnectButtons.forEach(button => {
                button.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
                button.classList.add('connected');
            });
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', function (accounts) {
                if (accounts.length === 0) {
                    // User disconnected wallet
                    walletAddress = null;
                    walletConnectButtons.forEach(button => {
                        button.textContent = 'Connect Wallet';
                        button.classList.remove('connected');
                    });
                } else {
                    walletAddress = accounts[0];
                    walletConnectButtons.forEach(button => {
                        button.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
                    });
                }
            });
            
            console.log("Connected to: " + accounts[0]);
            return true; // Connection successful
        } catch (error) {
            console.error("Connection failed:", error);
            return false; // Connection failed
        }
    } else {
        alert("MetaMask not detected. Please install it.");
        return false;
    }
}

async function purchaseNFT(nftTitle, price) {
    try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
            alert('MetaMask is not installed. Please install MetaMask to continue.');
            return;
        }
        
        // Request account access if needed
        if (!walletAddress) {
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                walletAddress = accounts[0];
                console.log("Wallet connected:", walletAddress);
            } catch (error) {
                console.error("User denied account access:", error);
                alert('Please connect your wallet to purchase this NFT.');
                return;
            }
        }
        
        // Initialize web3
        const web3 = new Web3(window.ethereum);
        
        // Convert price from ETH to Wei
        const priceInWei = web3.utils.toWei(price.toString(), 'ether');
        
        console.log("Preparing transaction...");
        console.log("From address:", walletAddress);
        console.log("Price in Wei:", priceInWei);
        
        // Create transaction parameters
        const transactionParameters = {
            to: '0xDDaC8A947691039d3056b4Cad9f6217f8Cf3aE58', // Replace with actual contract address
            from: walletAddress,
            value: web3.utils.toHex(priceInWei),
            gas: web3.utils.toHex(210000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei'))
        };
        
        console.log("Transaction parameters:", transactionParameters);
        
        // Send transaction
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        
        console.log("Transaction sent! Hash:", txHash);
        alert(`Purchase successful! Transaction Hash: ${txHash}`);
        
    } catch (error) {
        console.error("Error during purchase:", error);
        alert(`Transaction failed: ${error.message}`);
    }
}

// Function to show NFT modal
function showNFTModal(title, image, price) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'nft-modal';
    
    // Extract the ETH price value
    const ethPrice = price.split(' ')[0];
    
    // Modal content
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-image">
                <img src="${image}" alt="${title}">
            </div>
            <div class="modal-info">
                <h2>${title}</h2>
                <div class="modal-price">
                    <span class="label">Price:</span>
                    <span class="value">${price}</span>
                </div>
                <button class="buy-button" data-price="${ethPrice}">Buy Now</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Close modal when clicking the close button
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Buy button functionality
    const buyButton = modal.querySelector('.buy-button');
    buyButton.addEventListener('click', async function() {
        const price = this.dataset.price;
        await purchaseNFT(title, price);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners to wallet connect buttons
    walletConnectButtons.forEach(button => {
        button.addEventListener('click', connectWallet);
    });
    
    // Mobile menu toggle
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuIcon) {
        mobileMenuIcon.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Filter functionality
    const filterTags = document.querySelectorAll(".filter-tag");
    const categoryFilter = document.getElementById('category-filter');
    const collectionCards = document.querySelectorAll(".collection-card");

    function filterCollections(category) {
        collectionCards.forEach((card) => {
            const cardCategory = card.getAttribute("data-category").trim().toLowerCase();

            if (category === "all" || cardCategory === category) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    filterTags.forEach((tag) => {
        tag.addEventListener("click", function () {
            filterTags.forEach((t) => t.classList.remove("active"));
            this.classList.add("active");

            const category = this.getAttribute("data-category").trim().toLowerCase();
            console.log(`Filtering for category: ${category}`);
            filterCollections(category);
            
            // Update the dropdown to match
            if (categoryFilter) {
                categoryFilter.value = category;
            }
        });
    });

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            filterCollections(category);
            
            // Update filter tags to match
            filterTags.forEach(tag => {
                if (tag.getAttribute('data-category') === category) {
                    tag.classList.add('active');
                } else {
                    tag.classList.remove('active');
                }
            });
        });
    }
    
    // Make collection cards clickable
    collectionCards.forEach(card => {
        card.addEventListener('click', function() {
            const nftTitle = this.querySelector('h3').textContent;
            const nftImage = this.querySelector('img').src;
            const priceInfo = this.querySelector('.price-info .value').textContent;
            
            showNFTModal(nftTitle, nftImage, priceInfo);
        });
    });

    // Set default filter to 'all'
    filterCollections("all");
    
    // Initialize Web3 if MetaMask is available
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
    }
});