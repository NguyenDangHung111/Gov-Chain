import dotenv from 'dotenv';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';
import path from 'path';
import fs from 'fs';

dotenv.config();

const network = process.env.NETWORK || 'localhost';

let provider: JsonRpcProvider;
if (network === 'localhost') {
  provider = new ethers.JsonRpcProvider(process.env.LOCAL_RPC || 'http://127.0.0.1:8545');
} else {
  provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
}

const privateKey = process.env.PRIVATE_KEY || null;
let wallet: Wallet | null = null;
if (privateKey) {
  wallet = new ethers.Wallet(privateKey, provider);
}

// Load ABI
const abiPath = path.join(__dirname, '..', '..', 'abi', 'GovChain.json');
const govChainJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const abi = govChainJson.abi || govChainJson;

const contractAddress = process.env.CONTRACT_ADDRESS!;

const contract: Contract = new ethers.Contract(contractAddress, abi, wallet || provider);

export { provider, wallet, contract, ethers };
