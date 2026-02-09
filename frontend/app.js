const CROWDFUND_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const TOKEN_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";



const CROWDFUND_ABI = [
    "function createCampaign(string title, uint256 goal, uint256 duration) external",
    "function contribute(uint256 campaignId) external payable",
    "function getCampaign(uint256 id) view returns (address, string, uint256, uint256, uint256, bool, bool, bool)",
    "function campaignCount() view returns (uint256)",
    "function campaigns(uint256) view returns (address owner, string title, uint256 goal, uint256 deadline, uint256 raised, bool active, bool goalMet, bool rewarded)"
];

const TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];
let provider;
let signer;

async function connectMetaMask() {
    const statusEl = document.getElementById('connectionStatus');
    const addressEl = document.getElementById('walletAddress');
    const connectBtn = document.getElementById('connectBtn');

    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            const address = accounts[0];
            statusEl.innerText = "Connected";
            statusEl.className = "status-online";
            addressEl.innerText = `${address.substring(0, 6)}...${address.substring(38)}`;
            connectBtn.style.display = "none";
            updateBalances(address);
            loadCampaigns();

        } catch (error) {
            console.error("User denied account access", error);
            alert("Please connect to MetaMask");
        }
    } else {
        alert("MetaMask not found! Please install it.");
    }
}

async function updateBalances(address) {
    if (!provider) return;

    const ethBalance = await provider.getBalance(address);
    document.getElementById('ethBalance').innerText = 
        parseFloat(ethers.formatEther(ethBalance)).toFixed(4);

    try {
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        document.getElementById('rewardBalance').innerText = 
            parseFloat(ethers.formatUnits(balance, 18)).toFixed(2);
    } catch (e) {
        console.log("Token balance error - maybe contract not deployed?");
    }
}
async function createNewCampaign() {
    if (!signer) return alert("Please connect wallet first!");
    const title = document.getElementById('title').value;
    const goal = document.getElementById('goal').value;
    const duration = document.getElementById('duration').value;
    if (!title || !goal || !duration) return alert("Fill all fields!");

    try {
        const contract = new ethers.Contract(CROWDFUND_ADDRESS, CROWDFUND_ABI, signer);
        const goalInWei = ethers.parseEther(goal);
        const tx = await contract.createCampaign(title, goalInWei, duration);
        alert("Transaction sent! Waiting for confirmation...");
        await tx.wait();
        alert("Mission Launched Successfully!");
        loadCampaigns();
    } catch (error) {
        console.error("Error creating campaign:", error);
        alert("Transaction failed!");
    }
}
async function loadCampaigns() {
    const list = document.getElementById('campaignList');
    list.innerHTML = '<p class="loading-text">Updating galactic missions...</p>';
    setTimeout(() => {
        list.innerHTML = '<p>No active missions found on the current relay.</p>';
    }, 1000);
}

async function transferGTT() {
    if (!signer) {
        alert("Please connect MetaMask first!");
        return;
    }

    const to = document.getElementById("transferTo").value;
    const amount = document.getElementById("transferAmount").value;

    if (!ethers.isAddress(to)) {
        alert("Invalid recipient address!");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Enter a valid token amount!");
        return;
    }

    try {
        const tokenContract = new ethers.Contract(
            TOKEN_ADDRESS,
            TOKEN_ABI,
            signer
        );

        const decimals = await tokenContract.decimals();
        const amountInWei = ethers.parseUnits(amount, decimals);

        const tx = await tokenContract.transfer(to, amountInWei);
        alert("Transaction sent! Waiting for confirmation...");

        await tx.wait();
        alert("GTT Tokens transferred successfully 🚀");

        const senderAddress = await signer.getAddress();
        updateBalances(senderAddress);

        document.getElementById("transferTo").value = "";
        document.getElementById("transferAmount").value = "";

    } catch (error) {
        console.error("Transfer failed:", error);
        alert("Token transfer failed!");
    }
}
