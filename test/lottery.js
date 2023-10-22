const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat")

describe("Lottery contract", function () {
  let owner, player1, player2, player3, lotteryContract, lotteryContractAddress;

  before(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    lotteryContract = await ethers.deployContract("Lottery");
    await lotteryContract.waitForDeployment();
    lotteryContractAddress = await lotteryContract.getAddress();
  });

  it("should allow a player to enter the lottery", async function () {
    const initialBalance = await ethers.provider.getBalance(lotteryContractAddress);
  
    const transactionHash = await player1.sendTransaction({
      to: lotteryContractAddress,
      value: ethers.parseEther("0.1")
    });
    // console.log(lotteryContractAddress);
    // console.log(transactionHash);

    const updatedBalance = await ethers.provider.getBalance(lotteryContractAddress);
    const playerAddress = await lotteryContract.players(0);

    expect(updatedBalance).to.equal(initialBalance+(ethers.parseEther("0.1")));
    expect(playerAddress).to.equal(player1.address);
  });

  it("should not allow entering without 0.1 ether", async function () {
    try{
      let tx = await player1.sendTransaction({
        to: lotteryContractAddress,
        value: ethers.parseEther("0.05")
      });
    } catch(err){
      expect(err.message).to.contain("You need to send 0.1 ether");
    }  
  });

  it("should not allow picking a winner by a non-manager", async function () {
    await expect(lotteryContract.connect(player1).pickWinner()).to.be.revertedWith("Only the manager can pick a winner");
  });

  it("should allow the manager to pick a winner with at least three players", async function () {
    // Ensure there are at least three players
    await player1.sendTransaction({
      to: lotteryContractAddress,
      value: ethers.parseEther("0.1")
    });
    await player2.sendTransaction({
      to: lotteryContractAddress,
      value: ethers.parseEther("0.1")
    });
    await player3.sendTransaction({
      to: lotteryContractAddress,
      value: ethers.parseEther("0.1")
    });
  
    // Get the initial balance of the contract
    const initialBalance = await ethers.provider.getBalance(lotteryContractAddress);

    // The manager picks a winner
    await lotteryContract.connect(owner).pickWinner();
  
    // Get the updated balance of the contract
    const updatedBalance = await ethers.provider.getBalance(lotteryContractAddress);
  
    // Ensure that the contract balance is now zero
    expect(updatedBalance).to.equal(0);
  
    // Ensure that the players array is reset
    const players = await lotteryContract.players;
    expect(players.length).to.equal(0);
  });
});