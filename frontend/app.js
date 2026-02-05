const crowdfundAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; 
const tokenAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";     

const crowdfundAbi = [
    "function createCampaign(string title, uint256 goal, uint256 duration) external",
    "function contribute(uint256 campaignId) external payable",
    "function getCampaign(uint256 id) view returns (address, string, uint256, uint256, uint256, bool, bool, bool)",
    "function campaignCount() view returns (uint256)",
    "function campaigns(uint256) view returns (address owner, string title, uint256 goal, uint256 deadline, uint256 raised, bool active, bool goalMet, bool rewarded)"
];

const tokenAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

let provider, signer, contract, token;

async function connectMetaMask() {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            
            const accounts = await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            const address = accounts[0];
            document.getElementById('walletAddress').innerText = address.substring(0, 6) + "..." + address.substring(38);
            document.getElementById('connectionStatus').innerText = "Connected (Sepolia)";
            document.getElementById('connectBtn').innerText = "Connected ✅";

            contract = new ethers.Contract(crowdfundAddress, crowdfundAbi, signer);
            token = new ethers.Contract(tokenAddress, tokenAbi, signer);
            updateBalances(address);

        } catch (error) {
            console.error(error);
            alert("Connection error. Check the console (F12)");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function updateBalances(address) {
    const balance = await provider.getBalance(address);
    document.getElementById('ethBalance').innerText = ethers.formatEther(balance).substring(0, 6) + " ETH";

    if (token) {
        const tBalance = await token.balanceOf(address);
        document.getElementById('rewardBalance').innerText = ethers.formatEther(tBalance) + " GTT";
    }
}

async function createCampaign() {
    if (!contract) return alert("Please connect your wallet first!");
    
    const title = document.getElementById('title').value.trim();
    const goalValue = document.getElementById('goal').value.trim();
    
    if (!title) return alert("Please enter a project name!");
    if (!goalValue) return alert("Please enter a target amount!");
    
    if (isNaN(goalValue) || parseFloat(goalValue) <= 0) {
        return alert("Please enter a valid number greater than 0!");
    }
    
    try {
        const goal = ethers.parseEther(goalValue);
        const tx = await contract.createCampaign(title, goal, 3600); 
        await tx.wait();
        alert("Campaign successfully launched on the blockchain!");
        document.getElementById('title').value = '';
        document.getElementById('goal').value = '';
        connectMetaMask(); 
    } catch (e) {
        alert("Transaction error: " + e.message);
    }
}