const { describe, it, beforeEach } = require("mocha");
const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-as-promised"));
const { ethers } = require("hardhat");

describe("Phase 4 — Permit2 integration", function () {
  let subscription, permit2, user, service, token;

  beforeEach(async () => {
  [user, service] = await ethers.getSigners();

  const Permit2 = await ethers.getContractFactory("MockPermit2");
  permit2 = await Permit2.deploy();

  const Sub = await ethers.getContractFactory("TestOnchainSubscription");
  subscription = await Sub.deploy(permit2.address);

  token = ethers.Wallet.createRandom().address;

  await subscription.connect(user).createTokenSubscription(
    service.address,
    token,
    ethers.utils.parseEther("10"),
    0
    );
  });

  it("calls Permit2 for token payment", async () => {
    const permit = {
      permitted: {
        token,
        amount: ethers.utils.parseEther("1"),
      },
      nonce: 0,
      deadline: Math.floor(Date.now() / 1000) + 300,
    };

    const transferDetails = {
      to: service.address,
      requestedAmount: ethers.utils.parseEther("1"),
    };

    await expect(
      subscription.connect(service).claimPaymentWithPermit2(
        0,
        permit,
        transferDetails,
        "0x" // mock signature
      )
    ).to.be.fulfilled;
  });

});
