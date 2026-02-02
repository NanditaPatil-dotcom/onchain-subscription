import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("Starting deployment...");

  // Get contract factory
  const OnchainSubscription = await ethers.getContractFactory("OnchainSubscription");
  console.log("OnchainSubscription factory loaded");

  // Deploy contract
  const onchainSubscription = await OnchainSubscription.deploy();
  console.log("Deployment transaction sent, waiting for confirmation...");

  // Wait for deployment to complete (ethers v5 syntax)
  await onchainSubscription.deployed();
  console.log("Deployment confirmed!");

  // Get deployed address
  const address = onchainSubscription.address;
  console.log("OnchainSubscription deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
