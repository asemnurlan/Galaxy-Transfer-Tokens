import { expect } from "chai";
import { ethers } from "hardhat";

describe("GalaxyCrowdfund", function () {
  let token, crowdfund, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("GalaxyRewardToken");
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();

    const rewardRate = 100;
    const Crowdfund = await ethers.getContractFactory("GalaxyCrowdfund");
    crowdfund = await Crowdfund.deploy(await token.getAddress(), rewardRate);
    await crowdfund.waitForDeployment();

    await token.setMinter(await crowdfund.getAddress());
  });

  it("Should create a campaign", async function () {
    await crowdfund.createCampaign("Test Campaign", ethers.parseEther("1"), 3600);
    const campaign = await crowdfund.getCampaign(1);
    expect(campaign.title).to.equal("Test Campaign");
    expect(campaign.goalWei).to.equal(ethers.parseEther("1"));
  });

  it("Should allow contributions and mint rewards", async function () {
    await crowdfund.createCampaign("Test Campaign", ethers.parseEther("1"), 3600);
    await crowdfund.connect(addr1).contribute(1, { value: ethers.parseEther("0.5") });
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(ethers.parseEther("0.5") * 100n);
  });

  it("Should finalize campaign", async function () {
    await crowdfund.createCampaign("Test Campaign", ethers.parseEther("1"), 1);
    await ethers.provider.send("evm_increaseTime", [2]);
    await crowdfund.finalize(1);
    const campaign = await crowdfund.getCampaign(1);
    expect(campaign.finalized).to.be.true;
  });
});