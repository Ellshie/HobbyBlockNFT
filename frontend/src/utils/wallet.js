import { ethers } from "ethers";

export async function connectWallet() {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        return accounts[0];
    } else {
        alert("Please install MetaMask.");
        return null;
    }
}
