const { Web3 } = require('web3');
const { network } = require('hardhat');
const HobbyBlockArtifact = require('../artifacts/contracts/HobbyBlockNFT.sol/HobbyBlockNFT.json');

async function main() {
    if (network.name !== 'sepolia' && network.name !== 'ganache') {
        throw new Error('Please run the deployment script on the Sepolia network or localhost Hardhat network');
    }

    const web3 = new Web3(network.provider);
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    console.log("Deploying contracts with the account:", deployer);

    const balance = await web3.eth.getBalance(deployer);
    console.log("Account balance:", web3.utils.fromWei(balance, "ether"), "ETH");

    // Check for pending transactions
    const pendingNonce = await web3.eth.getTransactionCount(deployer, 'pending');
    const confirmedNonce = await web3.eth.getTransactionCount(deployer, 'latest');
    if (pendingNonce > confirmedNonce) {
        console.warn('There are pending transactions. You may want to wait for them to complete or replace them.');
    }

    const HobbyBlock = new web3.eth.Contract(HobbyBlockArtifact.abi);
    console.log('Deploying HobbyBlock...');

    const gasPrice = network.name === 'localhost' ? '20000000000' : await web3.eth.getGasPrice();
    const increasedGasPrice = BigInt(gasPrice) * BigInt(120) / BigInt(100); // 20% increase

    const estimatedGas = await HobbyBlock.deploy({
        data: HobbyBlockArtifact.bytecode,
        arguments: []
    }).estimateGas(deployer);

    const hobbyBlockContract = await HobbyBlock.deploy({
        data: HobbyBlockArtifact.bytecode,
        arguments: []
    }).send({
        from: deployer,
        gas: Math.floor(Number(estimatedGas)), // Use estimated gas with a 20% buffer, capped at 3M
        gasPrice: network.name === 'localhost' ? undefined : gasPrice.toString(),
        nonce: pendingNonce, // Use the pending nonce to avoid transaction conflicts
    });

    console.log("HobbyBlock deployed to:", hobbyBlockContract.options.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Deployment failed:', error);
        process.exitCode = 1;
    });
