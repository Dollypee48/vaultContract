const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vault", function () {
  let vault;
  let owner;
  let user;

  beforeEach(async function () {
    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();
    await vault.deployed();

    [owner, user] = await ethers.getSigners();
  });

  it("should let user deposit and set unlock time once", async function () {
    const currentTime = (await vault.getCurrentTimestamp()).toNumber();
    const unlockTime = currentTime + 300; // 5 minutes

    await vault.connect(user).depositEther(unlockTime, { value: ethers.utils.parseEther("1") });

    const balance = await vault.checkBalance({ from: user.address });
    expect(balance).to.equal(ethers.utils.parseEther("1"));

    const storedUnlock = await vault.checkUnlockTime({ from: user.address });
    expect(storedUnlock).to.equal(unlockTime);
  });

  it("should not allow withdrawal before unlock time", async function () {
    const currentTime = (await vault.getCurrentTimestamp()).toNumber();
    const unlockTime = currentTime + 300;

    await vault.connect(user).depositEther(unlockTime, { value: ethers.utils.parseEther("1") });

    await expect(
      vault.connect(user).withdrawEther(ethers.utils.parseEther("1"))
    ).to.be.revertedWith("Vault is still locked");
  });

  it("should allow withdrawal after unlock time", async function () {
    const currentTime = (await vault.getCurrentTimestamp()).toNumber();
    const unlockTime = currentTime + 2; // 2 seconds for quick test

    await vault.connect(user).depositEther(unlockTime, { value: ethers.utils.parseEther("1") });

    // wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    await vault.connect(user).withdrawEther(ethers.utils.parseEther("1"));

    const balance = await vault.checkBalance({ from: user.address });
    expect(balance).to.equal(0);
  });

  it("should not allow deposit of 0", async function () {
    const currentTime = (await vault.getCurrentTimestamp()).toNumber();
    const unlockTime = currentTime + 300;

    await expect(
      vault.connect(user).depositEther(unlockTime, { value: 0 })
    ).to.be.revertedWith("Invalid amount");
  });

  it("should not change unlock time on new deposit", async function () {
    const currentTime = (await vault.getCurrentTimestamp()).toNumber();
    const unlockTime = currentTime + 300;
    const newUnlockTime = currentTime + 600;

    await vault.connect(user).depositEther(unlockTime, { value: ethers.utils.parseEther("1") });
    await vault.connect(user).depositEther(newUnlockTime, { value: ethers.utils.parseEther("1") });

    const storedUnlock = await vault.checkUnlockTime({ from: user.address });
    expect(storedUnlock).to.equal(unlockTime);

    const balance = await vault.checkBalance({ from: user.address });
    expect(balance).to.equal(ethers.utils.parseEther("2"));
  });
});
