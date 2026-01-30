import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("Starting deployment...");

  // Get contract factory
  const Dummy = await ethers.getContractFactory("Dummy");
  console.log("Contract factory loaded");

  // Deploy contract
  const dummy = await Dummy.deploy();
  console.log("Deployment transaction sent, waiting for confirmation...");

  // Wait for deployment to complete
  await dummy.waitForDeployment();
  console.log("Deployment confirmed!");

  // Get deployed address
  const address = await dummy.getAddress();
  console.log("Dummy deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
