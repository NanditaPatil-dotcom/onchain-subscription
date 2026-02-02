const { describe, it, beforeEach } = require("mocha");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { ethers } = require("hardhat");

chai.use(chaiAsPromised);
const { expect } = chai;

describe("OnchainSubscription – Phase 2 lifecycle", function () {
  let contract;
  let user;
  let service;

  beforeEach(async () => {
    [user, service] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("OnchainSubscription");
    contract = await Factory.deploy();
    await contract.deployed();
  });

  it("creates a subscription with balance", async () => {
    await contract.connect(user).createSubscription(
      service.address,
      ethers.utils.parseEther("0.01"),
      30 * 24 * 60 * 60,
      { value: ethers.utils.parseEther("0.1") }
    );

    const sub = await contract.subscriptions(0);
    expect(sub.balance).to.deep.equal(ethers.utils.parseEther("0.1"));
    expect(sub.active).to.equal(true);
  });

  it("refunds remaining balance on cancel", async () => {
    await contract.connect(user).createSubscription(
      service.address,
      ethers.utils.parseEther("0.01"),
      100,
      { value: ethers.utils.parseEther("0.1") }
    );

    const before = await ethers.provider.getBalance(contract.address);

    await contract.connect(user).cancelSubscription(0);

    const after = await ethers.provider.getBalance(contract.address);

    expect(after).to.deep.equal(ethers.constants.Zero);
    expect(before).to.deep.equal(ethers.utils.parseEther("0.1"));
  });

  it("blocks payment before period", async () => {
    await contract.connect(user).createSubscription(
      service.address,
      ethers.utils.parseEther("0.01"),
      1000,
      { value: ethers.utils.parseEther("0.1") }
    );

    // Use the new claimPayment signature with valid signature params
    const expiry = Math.floor(Date.now() / 1000) + 300;

    // Sign with a wrong signer to trigger a different error, but the payment period check comes first
    const signature = await signApproval({
      signer: user,
      subscriptionId: 0,
      amount: ethers.utils.parseEther("0.01"),
      nonce: 0,
      expiry,
    });

    await expect(
      contract.connect(service).claimPayment(
        0,
        ethers.utils.parseEther("0.01"),
        0,
        expiry,
        signature
      )
    ).to.be.rejectedWith("Payment not due yet");
  });

  async function signApproval({
    signer,
    subscriptionId,
    amount,
    nonce,
    expiry,
  }) {
    const domain = {
      name: "OnchainSubscription",
      version: "1",
      chainId: 31337, // hardhat local
      verifyingContract: contract.address,
    };

    const types = {
      PaymentApproval: [
        { name: "subscriptionId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
    };

    return signer._signTypedData(domain, types, {
      subscriptionId,
      amount,
      nonce,
      expiry,
    });
  }
});
