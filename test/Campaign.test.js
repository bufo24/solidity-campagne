const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;

let campaignFactory;
let campaign;
let accounts;
beforeEach(async () => {
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  const Campaign = await ethers.getContractFactory("Campaign");
  accounts = await ethers.getSigners();
  campaignFactory = await CampaignFactory.deploy();
  await campaignFactory.connect(accounts[0]).createCampaign("100");
  let [campaignAddress] = await campaignFactory.getDeployedCampaigns();
  campaign = await Campaign.attach(campaignAddress);
});

describe("Campaign / CampaignFactory", () => {
  it("Deploy", async () => {
    assert.ok(campaignFactory.address);
    assert.ok(campaign.address);
  });
  it("Sets caller as owner", async () => {
    const owner = await campaign.owner();
    assert.equal(accounts[0].address, owner);
  });
  it("Allows people to contribute and mark then as approver", async () => {
    await campaign.connect(accounts[1]).contribute({ value: 200 });
    const isApprover = await campaign.approvers(accounts[1].address);
    assert(isApprover);
  });
  it("Requires a minimum contribution", async () => {
    await expect(campaign.connect(accounts[1]).contribute({ value: 100 })).to.be
      .reverted;
  });
  it("Allows a manager to make a payment request", async () => {
    await campaign
      .connect(accounts[0])
      .createRequest("Buy batteries", "1000", accounts[1].address);
    const request = await campaign.requests(0);
    assert.equal("Buy batteries", request.description);
  });
  it("Processes request", async () => {
    await campaign
      .connect(accounts[0])
      .contribute({ value: ethers.utils.parseEther("2") });
    await campaign
      .connect(accounts[0])
      .createRequest(
        "A request",
        ethers.utils.parseEther("1"),
        accounts[1].address
      );
    await campaign.connect(accounts[0]).approveRequest(0);
    let balance = await provider.getBalance(accounts[1].address);
    let first = ethers.utils.formatEther(balance);
    await campaign.connect(accounts[0]).finalizeRequest(0);
    balance = await provider.getBalance(accounts[1].address);
    let second = ethers.utils.formatEther(balance);
    assert.equal(second - first, 1);
  });
});
