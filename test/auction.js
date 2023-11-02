const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionCreator and Auction contracts", function () {
  let owner, player1, player2, auctionCreatorContract, auctionContract, auctionAddress;

  before(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    auctionCreatorContract = await ethers.deployContract("AuctionCreator");
    await auctionCreatorContract.waitForDeployment();

    // Create an auction
    await auctionCreatorContract.createAuction();

    const auctions = await auctionCreatorContract.auctions(0);
    auctionAddress = auctions.address;

    auctionContract = await ethers.getContractAt("Auction", auctionAddress);
  });

  it("should allow the owner to cancel the auction", async function () {
    // Ensure the auction is running
    const auctionState = await auctionContract.auctionState();
    expect(auctionState).to.equal(1); // Running

    // Cancel the auction
    await auctionContract.connect(owner).cancelAuction();

    // Ensure the auction is canceled
    const updatedAuctionState = await auctionContract.auctionState();
    expect(updatedAuctionState).to.equal(3); // Canceled
  });

  it("should allow players to place bids", async function () {
    // Ensure the auction is running
    const auctionState = await auctionContract.auctionState();
    expect(auctionState).to.equal(1); // Running

    // Player 1 places a bid
    await auctionContract.connect(player1).placeBid({ value: ethers.parseEther("0.1") });

    // Ensure the bid is placed correctly
    const player1Bid = await auctionContract.bids(player1.address);
    expect(player1Bid).to.equal(ethers.parseEther("0.1"));

    // Player 2 places a bid
    await auctionContract.connect(player2).placeBid({ value: ethers.parseEther("0.2") });

    // Ensure the bid is placed correctly
    const player2Bid = await auctionContract.bids(player2.address);
    expect(player2Bid).to.equal(ethers.parseEther("0.2"));
  });

  it("should not allow players to place bids after the auction has ended", async function () {
    // Advance the block time to after the auction end time
    await time.increase(604800); // Add 1 week

    // Try to place a bid
    await expect(auctionContract.connect(player1).placeBid({ value: ethers.parseEther("0.1") })).to.be.revertedWith("Auction has ended");
  });

  it("should allow the owner to finalize the auction", async function () {
    // Ensure the auction has ended
    const auctionState = await auctionContract.auctionState();
    expect(auctionState).to.equal(2); // Ended

    // Finalize the auction
    await auctionContract.connect(owner).finalizeAuction();

    // Ensure the auction is finalized
    const updatedAuctionState = await auctionContract.auctionState();
    expect(updatedAuctionState).to.equal(0); // Finalized
  });
});
