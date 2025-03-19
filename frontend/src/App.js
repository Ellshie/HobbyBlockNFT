import { useState } from "react";
import { ethers } from "ethers";
import HobbyBlockNFT from "./contracts/HobbyBlockNFT.json";

const CONTRACT_ADDRESS = "0xA334D2a96A5d040D2b6Bc0d0950B3B0C389DCd3D";

function App() {
    const [account, setAccount] = useState(null);
    const [nftURI, setNftURI] = useState("");

    async function connectWallet() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
        }
    }

    async function mintNFT() {
        if (!nftURI) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, HobbyBlockNFT.abi, signer);
        await contract.createNFT(nftURI);
        alert("NFT Minted Successfully!");
    }

    return (
        <div>
            <button onClick={connectWallet}>Connect Wallet</button>
            <input 
                type="text" 
                placeholder="Enter NFT URI" 
                value={nftURI} 
                onChange={(e) => setNftURI(e.target.value)}
            />
            <button onClick={mintNFT}>Mint NFT</button>
        </div>
    );
}

export default App;
