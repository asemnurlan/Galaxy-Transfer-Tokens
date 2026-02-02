import hre from "hardhat";

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
