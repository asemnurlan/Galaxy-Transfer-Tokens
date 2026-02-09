const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy reward token with deployer as the initial owner
  const GalaxyToken = await ethers.getContractFactory("GalaxyRewardToken");
  const token = await GalaxyToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GalaxyRewardToken deployed to:", tokenAddress);

  // Deploy crowdfund with the token address and an initial reward rate
  const INITIAL_REWARD_RATE = 1000; // tokens per wei (adjust as needed)
  const GalaxyCrowdfund = await ethers.getContractFactory("GalaxyCrowdfund");
  const crowdfund = await GalaxyCrowdfund.deploy(tokenAddress, INITIAL_REWARD_RATE);
  await crowdfund.waitForDeployment();
  const crowdfundAddress = await crowdfund.getAddress();
  console.log("GalaxyCrowdfund deployed to:", crowdfundAddress);

  // Set the crowdfund contract as the minter on the reward token
  const tx = await token.setMinter(crowdfundAddress);
  await tx.wait();
  console.log("Set crowdfund as token minter:", crowdfundAddress);

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
