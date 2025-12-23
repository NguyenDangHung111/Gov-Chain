import { contract } from '../config/blockchain.config';

interface TransactionResult {
  txHash: string;
  caseId?: string;
}

interface CaseData {
  id: string;
  citizen: string;
  citizenId: string;
  fileHash: string;
  description: string;
  status: number;
  createdAt: number;
}

interface CaseLog {
  caseId: string;
  status: number;
  actor: string;
  timestamp: number;
  note: string;
}

// Submit a new case on blockchain
export const submitCase = async (
  citizenId: string,
  fileHash: string,
  description: string
): Promise<TransactionResult> => {
  const tx = await contract.submitCase(citizenId, fileHash, description);
  const receipt = await tx.wait();
  
  let caseId: string | undefined;

  // Parse logs to find CaseSubmitted event
  if (receipt && receipt.logs) {
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log as any);
        if (parsedLog && parsedLog.name === 'CaseSubmitted') {
          // args[0] is caseId based on ABI
          caseId = parsedLog.args[0].toString();
          break;
        }
      } catch (e) {
        // Ignore logs that cannot be parsed
      }
    }
  }

  if (!caseId) {
    // Fallback: try to fetch caseCounter if event parsing failed
    try {
      const caseCount = await contract.caseCounter();
      caseId = caseCount.toString();
    } catch (error) {
      console.error("Error fetching caseCounter:", error);
      throw new Error("Transaction mined but Case ID could not be retrieved. Please verify CONTRACT_ADDRESS points to a valid GovChain contract.");
    }
  }

  return { txHash: receipt.hash, caseId: caseId! };
};

// Update case status on blockchain
export const updateCaseStatus = async (
  caseId: string | number,
  status: string | number,
  note: string
): Promise<{ txHash: string }> => {
  const cId = Number(caseId);
  const st = Number(status);
  if (isNaN(cId) || isNaN(st)) {
    throw new Error(`Invalid arguments: caseId=${caseId}, status=${status}`);
  }
  const tx = await contract.updateStatus(cId, st, note);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
};

// Get case by ID from blockchain
export const getCase = async (caseId: string | number): Promise<CaseData> => {
  const cId = Number(caseId);
  if (isNaN(cId)) {
    throw new Error(`Invalid caseId: ${caseId}`);
  }
  const cf = await contract.getCase(cId);
  // mapping solidity return -> ts object
  return {
    id: cf.id.toString(),
    citizen: cf.citizen,
    citizenId: cf.citizenId,
    fileHash: cf.fileHash,
    description: cf.description,
    status: Number(cf.status),
    createdAt: Number(cf.createdAt)
  };
};

// Get all cases
export const getAllCases = async (): Promise<CaseData[]> => {
  const count = await contract.caseCounter();
  const total = Number(count);
  const cases: CaseData[] = [];

  for (let i = 1; i <= total; i++) {
    try {
      const c = await getCase(i);
      cases.push(c);
    } catch (err) {
      console.error(`Error fetching case ${i}:`, err);
    }
  }
  return cases;
};

// Get case logs from blockchain
export const getCaseLogs = async (caseId: string | number): Promise<CaseLog[]> => {
  const cId = Number(caseId);
  if (isNaN(cId)) {
    throw new Error(`Invalid caseId: ${caseId}`);
  }
  const logs = await contract.getCaseLogs(cId);
  return logs.map((l: any) => ({
    caseId: l.caseId.toString(),
    status: Number(l.status),
    actor: l.actor,
    timestamp: Number(l.timestamp),
    note: l.note
  }));
};

// Get all cases for a specific citizen ID
export const getCasesByCitizenId = async (citizenId: string): Promise<CaseData[]> => {
  try {
    const caseCount = await contract.caseCounter();
    const total = Number(caseCount);
    const promises: Promise<CaseData>[] = [];

    for (let i = 1; i <= total; i++) {
      promises.push(getCase(i));
    }

    const allCases = await Promise.all(promises);
    return allCases.filter(c => c.citizenId === citizenId);
  } catch (error) {
    console.error('Error fetching cases by citizen ID:', error);
    return [];
  }
};


