const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat")

describe("Lottery contract", function () {
  let owner, player1, player2, player3, lotteryContract;

  before(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    const Lottery = await ethers.getContractFactory("Lottery");
    lotteryContract = await Lottery.deploy();
  });

  it("should allow a player to enter the lottery", async function () {
    const initialBalance = await ethers.provider.getBalance(lotteryContract.runner.address);
    console.log(initialBalance);
    
    console.log(player1);
    console.log(player1.address);
    await lotteryContract.connect(player1.address).sendTransaction({ value: ethers.parseEther("0.1") });

    const updatedBalance = await ethers.provider.getBalance(lotteryContract.runner.address);
    const playerAddress = await lotteryContract.players(0);

    expect(updatedBalance).to.equal(initialBalance.add(ethers.parseEther("0.1")));
    expect(playerAddress).to.equal(player1.address);
  });

  // it("should not allow entering without 0.1 ether", async function () {
  //   await expect(
  //     lotteryContract.connect(player2).sendTransaction({ value: ethers.utils.parseEther("0.05") })
  //   ).to.be.revertedWith("Value sent must be 0.1 ether");
  // });

  // it("should not allow picking a winner by a non-manager", async function () {
  //   await expect(lotteryContract.connect(player1).pickWinner()).to.be.revertedWith("Only the manager can pick a winner");
  // });
});