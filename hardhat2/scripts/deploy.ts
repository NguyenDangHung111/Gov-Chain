import {ethers} from "hardhat";

async function main() {
  const GovChain = await ethers.getContractFactory("GovChain");
  const govChain = await GovChain.deploy();

  await govChain.waitForDeployment();

  console.log("GovChain deployed to:", govChain.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
