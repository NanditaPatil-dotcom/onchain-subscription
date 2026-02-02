const { describe, it, beforeEach } = require("mocha");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { ethers } = require("hardhat");

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Phase 3 — Consent-based payments (EIP-712)", function () {
  let contract, user, service;

  beforeEach(async () => {
    [user, service] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("OnchainSubscription");
    contract = await Factory.deploy();
    await contract.deployed();

    // Use period=0 so payment is due immediately after creation
    await contract.connect(user).createSubscription(
      service.address,
      ethers.utils.parseEther("0.01"),
      0, // period of 0 so payment is due immediately
      { value: ethers.utils.parseEther("0.1") }
    );
  });

  it("allows payment with valid signature", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 300;

    const signature = await signApproval({
      signer: user,
      subscriptionId: 0,
      amount: ethers.utils.parseEther("0.01"),
      nonce: 0,
      expiry,
    });

    const serviceBefore = await ethers.provider.getBalance(service.address);
    const contractBefore = await ethers.provider.getBalance(contract.address);

    await contract.connect(service).claimPayment(
      0,
      ethers.utils.parseEther("0.01"),
      0,
      expiry,
      signature
    );

    const serviceAfter = await ethers.provider.getBalance(service.address);
    const contractAfter = await ethers.provider.getBalance(contract.address);

    // Service received some ETH (exact amount varies due to gas costs)
    expect(serviceAfter.sub(serviceBefore).gt(0)).to.be.true;

    // Contract balance decreased by exactly 0.01 ETH
    expect(
    contractBefore.sub(contractAfter).eq(
    ethers.utils.parseEther("0.01")
    )
   ).to.equal(true);

  });

  it("reverts on reused signature (nonce replay)", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 300;

    const signature = await signApproval({
      signer: user,
      subscriptionId: 0,
      amount: ethers.utils.parseEther("0.01"),
      nonce: 0,
      expiry,
    });

    await contract.connect(service).claimPayment(
      0,
      ethers.utils.parseEther("0.01"),
      0,
      expiry,
      signature
    );

    // Create a new signature with same nonce (should fail)
    const newSignature = await signApproval({
      signer: user,
      subscriptionId: 0,
      amount: ethers.utils.parseEther("0.01"),
      nonce: 0, // same nonce - should fail
      expiry,
    });

    await expect(
      contract.connect(service).claimPayment(
        0,
        ethers.utils.parseEther("0.01"),
        0,
        expiry,
        newSignature
      )
    ).to.be.rejectedWith("Invalid nonce");
  });

  it("reverts on expired signature", async () => {
    const expiry = Math.floor(Date.now() / 1000) - 10; // already expired

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
    ).to.be.rejectedWith("Signature expired");
  });

  it("reverts if signature not from subscriber", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 300;

    const signature = await signApproval({
      signer: service, // WRONG signer - service instead of subscriber
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
    ).to.be.rejectedWith("Invalid signature");
  });


  async function signApproval({
    signer,
    subscriptionId,
    amount,
    nonce,
    expiry,
  }) {
    const { chainId } = await ethers.provider.getNetwork();
    const domain = {
      name: "OnchainSubscription",
      version: "1",
      chainId, // hardhat local
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
