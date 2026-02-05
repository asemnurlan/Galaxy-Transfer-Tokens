const crowdfundAddress = ""; // Адрес контракта GalaxyCrowdfund
const tokenAddress = "";     // Адрес контракта GalaxyRewardToken

const crowdfundAbi = [
    "function createCampaign(string title, uint256 goal, uint256 duration) external",
    "function campaignCount() public view returns (uint256)"
];
const tokenAbi = ["function balanceOf(address owner) view returns (uint256)"];

let provider, signer, contract, token;

async function connectMetaMask() {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            
            const accounts = await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            const address = accounts[0];
            document.getElementById('walletAddress').innerText = address.substring(0, 6) + "..." + address.substring(38);
            document.getElementById('connectionStatus').innerText = "Подключено (Sepolia)";
            document.getElementById('connectBtn').innerText = "Готово ✅";

            contract = new ethers.Contract(crowdfundAddress, crowdfundAbi, signer);
            token = new ethers.Contract(tokenAddress, tokenAbi, signer);
            updateBalances(address);

        } catch (error) {
            console.error(error);
            alert("Ошибка подключения. Проверьте консоль (F12)");
        }
    } else {
        alert("Установите MetaMask!");
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
    if (!contract) return alert("Сначала подключите кошелек!");
    
    const title = document.getElementById('title').value;
    const goal = ethers.parseEther(document.getElementById('goal').value);

    try {
        const tx = await contract.createCampaign(title, goal, 3600); 
        await tx.wait();
        alert("Проект успешно создан в блокчейне!");
        connectMetaMask(); 
    } catch (e) {
        alert("Ошибка транзакции: " + e.message);
    }
}