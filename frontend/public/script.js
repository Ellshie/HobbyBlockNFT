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

document.addEventListener("DOMContentLoaded", function () {
    const filterTags = document.querySelectorAll(".filter-tag");
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
        });
    });

    // Set default filter to 'all'
    filterCollections("all");
});
