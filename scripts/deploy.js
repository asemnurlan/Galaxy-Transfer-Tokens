/*import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await hre.ethers.getContractFactory("GalaxyRewardToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("GalaxyRewardToken deployed:", tokenAddress);

  const rewardRate = 100n;
  const Crowdfund = await hre.ethers.getContractFactory("GalaxyCrowdfund");
  const crowdfund = await Crowdfund.deploy(tokenAddress, rewardRate);
  await crowdfund.waitForDeployment();

  const crowdfundAddress = await crowdfund.getAddress();
  console.log("GalaxyCrowdfund deployed:", crowdfundAddress);

  const tx = await token.setMinter(crowdfundAddress);
  await tx.wait();
  console.log("Minter set to:", crowdfundAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
*/
import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Явно дожидаемся инициализации ethers через hre
  const ethers = hre.ethers;

  // 1. Получаем аккаунт
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 2. Деплоим токен
  const GalaxyToken = await ethers.getContractFactory("GalaxyRewardToken");
  const token = await GalaxyToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GalaxyRewardToken deployed to:", tokenAddress);

  // 3. Деплоим краудфандинг
  const GalaxyCrowdfund = await ethers.getContractFactory("GalaxyCrowdfund");
  const crowdfund = await GalaxyCrowdfund.deploy(tokenAddress);
  await crowdfund.waitForDeployment();
  const crowdfundAddress = await crowdfund.getAddress();
  console.log("GalaxyCrowdfund deployed to:", crowdfundAddress);

  console.log("\nSuccess!");
  console.log("TOKEN_ADDRESS:", tokenAddress);
  console.log("CROWDFUND_ADDRESS:", crowdfundAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
