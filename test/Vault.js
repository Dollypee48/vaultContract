const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("vault contract", function () {

  let vault;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("vault");
    vault = await Vault.deploy();
    await vault.waitForDeployment();
  });

  it("allows deposit of Ether", async function () {
    const amount = ethers.parseEther("1");

    await vault.connect(user).saveEther({ value: amount });

    const balance = await vault.connect(user).checkBalance();
    expect(balance._userBalance).to.equal(amount);
  });

  it("rejects zero deposit", async function () {
    await expect(
      vault.connect(user).saveEther({ value: 0 })
    ).to.be.revertedWith("Invalid amount");
  });

  it("allows withdrawal of Ether", async function () {
    const amount = ethers.parseEther("1");
    const half = ethers.parseEther("0.5");

    await vault.connect(user).saveEther({ value: amount });
    await vault.connect(user).withdrawEther(half);

    const balance = await vault.connect(user).checkBalance();
    expect(balance._userBalance).to.equal(amount - half);
  });

  it("rejects too much withdrawal", async function () {
    const amount = ethers.parseEther("1");

    await vault.connect(user).saveEther({ value: amount });

    await expect(
      vault.connect(user).withdrawEther(ethers.parseEther("2"))
    ).to.be.revertedWith("Not enough");
  });

  it("returns user balance and contract balance", async function () {
    const amount = ethers.parseEther("1");

    await vault.connect(user).saveEther({ value: amount });

    const balance = await vault.connect(user).checkBalance();

    expect(balance._userBalance).to.equal(amount);
    expect(balance._contractBalance).to.equal(amount);
  });

});
