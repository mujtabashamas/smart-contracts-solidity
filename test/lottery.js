const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Lottery contract", function () {
  it("GET Balance", async function () {
    const [owner] = await ethers.getSigners();

    const lotteryContract = await ethers.deployContract("Lottery");

    const balance = (await lotteryContract.getBalance()).toString();
    let result = false;
    if(balance) {
      console.log("Balance: ", balance);
      result = true;
    }

    expect(result).to.be.true;
  });
});
