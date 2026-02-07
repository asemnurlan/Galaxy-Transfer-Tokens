import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");
  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const GalaxyToken = await ethers.getContractFactory("GalaxyRewardToken");
  const token = await GalaxyToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GalaxyRewardToken deployed to:", tokenAddress);
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
