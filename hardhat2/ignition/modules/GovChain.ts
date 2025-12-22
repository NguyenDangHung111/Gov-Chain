import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GovChainModule = buildModule("GovChainModule", (m) => {
  const govChain = m.contract("GovChain");

  return { govChain };
});

export default GovChainModule;
