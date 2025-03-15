document.addEventListener("DOMContentLoaded", () => {
    const walletButton = document.querySelector("button");
    
    async function connectWallet() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                alert(`Connected: ${accounts[0]}`);
            } catch (error) {
                console.error("Wallet connection failed", error);
                alert("Failed to connect wallet.");
            }
        } else {
            alert("MetaMask not detected. Please install MetaMask.");
        }
    }
    
    walletButton.addEventListener("click", connectWallet);
});
