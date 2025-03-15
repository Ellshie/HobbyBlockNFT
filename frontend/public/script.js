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
