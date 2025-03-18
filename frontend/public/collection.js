// collection.js - Script for the personal collection page

document.addEventListener("DOMContentLoaded", function() {
    console.log("Personal collection script loaded!");
    
    // Elements
    const connectWalletBtn = document.querySelector('.wallet-connect');
    const walletAddressDisplay = document.getElementById('user-wallet-address');
    const walletBalanceDisplay = document.getElementById('user-wallet-balance');
    const refreshBtn = document.getElementById('refresh-btn');
    const collectionGrid = document.getElementById('collection-grid');
    const emptyState = document.getElementById('empty-state');
    const sortFilter = document.getElementById('sort-filter');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('collection-search');
    
    let userNFTs = []; // Array to store user's purchased NFTs
    let walletAddress = null;
    let nftContract = null; // Contract instance
    
    // NFT Contract Address - Replace with your actual contract address
    const nftContractAddress = "0x123456789abcdef123456789abcdef123456789a"; // Replace with your contract address
    
    // Load ABI file
    async function loadContractABI() {
        try {
            // Fetch the ABI file
            const response = await fetch('./assets/contracts/nft-contract-abi.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const abi = await response.json();
            console.log("Contract ABI loaded successfully");
            return abi;
        } catch (error) {
            console.error("Failed to load contract ABI:", error);
            // Fallback to minimal ABI if file loading fails
            console.warn("Using fallback minimal ABI");
            return [
                {
                    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "uint256", "name": "index", "type": "uint256"}],
                    "name": "tokenOfOwnerByIndex",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
                    "name": "tokenURI",
                    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];
        }
    }
    
    // Initialize Web3
    async function initWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                // Load contract ABI
                const contractABI = await loadContractABI();
                
                // Initialize NFT contract
                nftContract = new window.web3.eth.Contract(
                    contractABI,
                    nftContractAddress
                );
                console.log("NFT contract initialized successfully");
                return true;
            } catch (error) {
                console.error("Failed to initialize NFT contract:", error);
                return false;
            }
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            try {
                // Load contract ABI
                const contractABI = await loadContractABI();
                
                // Initialize NFT contract
                nftContract = new window.web3.eth.Contract(
                    contractABI,
                    nftContractAddress
                );
                console.log("NFT contract initialized successfully");
                return true;
            } catch (error) {
                console.error("Failed to initialize NFT contract:", error);
                return false;
            }
        } else {
            console.error("No web3 provider detected");
            return false;
        }
    }
    
    // Update the wallet info display
    async function updateWalletInfo() {
        if (!walletAddress) {
            walletAddressDisplay.textContent = "Connect your wallet";
            walletBalanceDisplay.innerHTML = "0.00 <span>ETH</span>";
            return;
        }
        
        // Update address display
        walletAddressDisplay.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
        
        // Update balance if web3 is available
        if (window.web3) {
            try {
                const balanceWei = await window.web3.eth.getBalance(walletAddress);
                const balanceEth = window.web3.utils.fromWei(balanceWei, 'ether');
                walletBalanceDisplay.innerHTML = `${parseFloat(balanceEth).toFixed(4)} <span>ETH</span>`;
            } catch (error) {
                console.error("Failed to fetch balance:", error);
                walletBalanceDisplay.innerHTML = `0.00 <span>ETH</span>`;
            }
        }
    }
    
    // Connect wallet function
    async function connectWallet() {
        if (!window.ethereum) {
            alert("MetaMask not detected. Please install it.");
            return false;
        }
        
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            walletAddress = accounts[0];
            
            // Update button text
            if (connectWalletBtn) {
                connectWalletBtn.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
                connectWalletBtn.classList.add('connected');
            }
            
            // Update wallet display
            updateWalletInfo();
            
            // Fetch and display user's NFTs
            await fetchUserNFTs();
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', function (accounts) {
                if (accounts.length === 0) {
                    // User disconnected wallet
                    walletAddress = null;
                    if (connectWalletBtn) {
                        connectWalletBtn.textContent = 'Connect Wallet';
                        connectWalletBtn.classList.remove('connected');
                    }
                    clearUserNFTs(); // Clear displayed NFTs
                    updateWalletInfo();
                } else {
                    walletAddress = accounts[0];
                    if (connectWalletBtn) {
                        connectWalletBtn.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
                        connectWalletBtn.classList.add('connected');
                    }
                    updateWalletInfo();
                    fetchUserNFTs(); // Fetch and display NFTs for the new account
                }
            });
            
            console.log("Connected to wallet:", walletAddress);
            return true;
        } catch (error) {
            console.error("Connection failed:", error);
            return false;
        }
    }
    
    // Fetch user's NFTs
    async function fetchUserNFTs() {
        if (!walletAddress || !nftContract) {
            console.error("Wallet not connected or contract not initialized");
            return;
        }
        
        try {
            // Show loading state
            if (collectionGrid) {
                collectionGrid.innerHTML = '<div class="loading">Loading your NFTs...</div>';
            }
            
            // Get the number of NFTs owned by the user
            const balance = await nftContract.methods.balanceOf(walletAddress).call();
            console.log(`User owns ${balance} NFTs`);
            
            // Fetch all NFTs owned by the user
            let nfts = [];
            for (let i = 0; i < balance; i++) {
                try {
                    // Get token ID
                    const tokenId = await nftContract.methods.tokenOfOwnerByIndex(walletAddress, i).call();
                    console.log(`Found token ID: ${tokenId}`);
                    
                    // Get token URI
                    const tokenURI = await nftContract.methods.tokenURI(tokenId).call();
                    console.log(`Token URI for ${tokenId}: ${tokenURI}`);
                    
                    // Fetch metadata from token URI
                    const metadata = await fetchNFTMetadata(tokenURI);
                    console.log(`Metadata for token ${tokenId}:`, metadata);
                    
                    // Add to NFTs array
                    nfts.push({
                        id: tokenId,
                        title: metadata.name || `NFT #${tokenId}`,
                        image: metadata.image || 'https://via.placeholder.com/300?text=NFT',
                        price: metadata.price || 'N/A',
                        category: metadata.category || 'uncategorized',
                        purchaseDate: metadata.purchaseDate || 'Unknown',
                        description: metadata.description || '',
                        attributes: metadata.attributes || []
                    });
                } catch (error) {
                    console.error(`Error fetching NFT at index ${i}:`, error);
                }
            }
            
            userNFTs = nfts;
            console.log("Fetched NFTs:", userNFTs);
            
            // Display NFTs
            displayUserNFTs();
            
            // Apply any active filters
            applyFilters();
            
        } catch (error) {
            console.error("Failed to fetch NFTs:", error);
            if (collectionGrid) {
                collectionGrid.innerHTML = '<div class="error">Failed to load your NFTs. Please try again.</div>';
            }
        }
    }
    
    // Fetch NFT metadata from token URI
    async function fetchNFTMetadata(tokenURI) {
        try {
            // If the tokenURI is an IPFS URI, convert it to an HTTP URL
            let url = tokenURI;
            if (tokenURI.startsWith('ipfs://')) {
                url = 'https://ipfs.io/ipfs/' + tokenURI.substring(7);
            }
            
            // Check if the URL is relative or absolute
            if (!url.startsWith('http') && !url.startsWith('/')) {
                url = './' + url; // Assume relative to current path
            }
            
            console.log(`Fetching metadata from: ${url}`);
            
            // Fetch the metadata
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const metadata = await response.json();
            return metadata;
        } catch (error) {
            console.error("Failed to fetch metadata:", error);
            return {
                name: 'Unknown NFT',
                image: 'https://via.placeholder.com/300?text=Metadata+Error',
                category: 'unknown'
            };
        }
    }
    
    // Display user's NFTs in collection grid
    function displayUserNFTs() {
        if (!collectionGrid || !emptyState) return;
        
        // Clear previous content
        collectionGrid.innerHTML = '';
        
        if (userNFTs.length === 0) {
            // Show empty state
            emptyState.style.display = 'block';
            return;
        }
        
        // Hide empty state
        emptyState.style.display = 'none';
        
        // Create and append NFT cards
        userNFTs.forEach(nft => {
            const nftCard = document.createElement('div');
            nftCard.className = 'collection-item';
            nftCard.setAttribute('data-category', nft.category);
            
            nftCard.innerHTML = `
                <img src="${nft.image}" alt="${nft.title}" class="collection-img" onerror="this.src='https://via.placeholder.com/300?text=Image+Error'">
                <div class="collection-info">
                    <h3 class="collection-title">${nft.title}</h3>
                    <div class="collection-details">
                        <span class="collection-price">${nft.price} ETH</span>
                        <span class="collection-date">${nft.purchaseDate}</span>
                    </div>
                    <span class="collection-category">${nft.category}</span>
                </div>
            `;
            
            collectionGrid.appendChild(nftCard);
            
            // Make the card clickable to show details
            nftCard.addEventListener('click', function() {
                showNFTDetails(nft);
            });
        });
    }
    
    // Clear user's NFTs display
    function clearUserNFTs() {
        userNFTs = [];
        
        if (collectionGrid) {
            collectionGrid.innerHTML = '';
        }
        
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }
    
    // Show NFT details in a modal
    function showNFTDetails(nft) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'nft-modal';
        
        // Create attributes HTML if attributes exist
        let attributesHTML = '';
        if (nft.attributes && nft.attributes.length > 0) {
            attributesHTML = '<div class="attributes-section"><h3>Attributes</h3><div class="attributes-grid">';
            nft.attributes.forEach(attr => {
                attributesHTML += `
                    <div class="attribute-item">
                        <span class="attribute-type">${attr.trait_type}</span>
                        <span class="attribute-value">${attr.value}</span>
                    </div>
                `;
            });
            attributesHTML += '</div></div>';
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-image">
                    <img src="${nft.image}" alt="${nft.title}" onerror="this.src='https://via.placeholder.com/300?text=Image+Error'">
                </div>
                <div class="modal-info">
                    <h2>${nft.title}</h2>
                    ${nft.description ? `<p class="nft-description">${nft.description}</p>` : ''}
                    <div class="info-row">
                        <span class="label">Price:</span>
                        <span class="value">${nft.price} ETH</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Category:</span>
                        <span class="value">${nft.category}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Purchased:</span>
                        <span class="value">${nft.purchaseDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Token ID:</span>
                        <span class="value">${nft.id}</span>
                    </div>
                    ${attributesHTML}
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
    }
    
    // Apply filters to the displayed NFTs
    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const category = categoryFilter ? categoryFilter.value : 'all';
        const sortBy = sortFilter ? sortFilter.value : 'recent';
        
        // Get all NFT items
        const items = document.querySelectorAll('.collection-item');
        
        // Apply category and search filters
        items.forEach(item => {
            const title = item.querySelector('.collection-title').textContent.toLowerCase();
            const itemCategory = item.getAttribute('data-category').toLowerCase();
            
            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = category === 'all' || itemCategory === category;
            
            // Show/hide based on filters
            if (matchesSearch && matchesCategory) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Initialize the page
    async function init() {
        // Initialize Web3
        const web3Available = await initWeb3();
        if (!web3Available) {
            console.warn("Web3 not available. Some features may not work.");
        }
        
        // Add event listeners
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', connectWallet);
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async function() {
                await updateWalletInfo();
                await fetchUserNFTs();
            });
        }
        
        // Add event listeners for filters
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', function() {
                const sortMethod = this.value;
                
                // Get all items and convert to array for sorting
                const items = Array.from(document.querySelectorAll('.collection-item'));
                const parent = collectionGrid;
                
                // Sort items
                items.sort((a, b) => {
                    const titleA = a.querySelector('.collection-title').textContent;
                    const titleB = b.querySelector('.collection-title').textContent;
                    const priceA = parseFloat(a.querySelector('.collection-price').textContent);
                    const priceB = parseFloat(b.querySelector('.collection-price').textContent);
                    const dateA = a.querySelector('.collection-date').textContent;
                    const dateB = b.querySelector('.collection-date').textContent;
                    
                    switch(sortMethod) {
                        case 'recent':
                            return new Date(dateB) - new Date(dateA);
                        case 'oldest':
                            return new Date(dateA) - new Date(dateB);
                        case 'price-high':
                            return priceB - priceA;
                        case 'price-low':
                            return priceA - priceB;
                        default:
                            return 0;
                    }
                });
                
                // Remove all items
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
                
                // Re-append sorted items
                items.forEach(item => parent.appendChild(item));
            });
        }
        
        // Check if wallet is already connected (e.g., user refreshed the page)
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    walletAddress = accounts[0];
                    console.log("Wallet already connected:", walletAddress);
                    
                    // Update button state
                    if (connectWalletBtn) {
                        connectWalletBtn.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
                        connectWalletBtn.classList.add('connected');
                    }
                    
                    // Update wallet info and fetch NFTs
                    await updateWalletInfo();
                    await fetchUserNFTs();
                }
            } catch (error) {
                console.error("Error checking connected accounts:", error);
            }
        }
    }
    
    // Initialize
    init();
});