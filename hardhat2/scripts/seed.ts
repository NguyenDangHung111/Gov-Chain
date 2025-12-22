import { ethers } from "hardhat";

async function main() {
  // 1. Deploy Contract
  console.log("🚀 Starting Seed Script...");
  
  const GovChain = await ethers.getContractFactory("GovChain");
  const govChain = await GovChain.deploy();
  await govChain.waitForDeployment();
  const govChainAddress = await govChain.getAddress();

  console.log(`✅ GovChain deployed to: ${govChainAddress}`);
  console.log(`👉 Contract Address: ${govChainAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
