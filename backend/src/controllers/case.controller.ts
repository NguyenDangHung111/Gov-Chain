import { Request, Response } from 'express';
import * as bc from '../services/blockchain.service';
import { hashContent, uploadToIpfs } from '../services/file.service';

export const submitCase = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('--- Submit Case Debug ---');
    console.log('Body:', req.body);
    console.log('File:', req.file ? 'Present' : 'Missing');

    const { citizenId, description } = req.body;
    const file = req.file;

    if (!citizenId) {
      res.status(400).json({ success: false, message: 'citizenId is missing from request body', receivedBody: req.body });
      return;
    }
    if (!file) {
      res.status(400).json({ success: false, message: 'File is missing from request' });
      return;
    }

    const fileHash = await uploadToIpfs(file.buffer);
    const result = await bc.submitCase(citizenId, fileHash, description || '');
    res.json({ success: true, data: { ...result, fileHash } });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId } = req.params;
    const { status, note } = req.body;
    if (!caseId) {
      res.status(400).json({ success: false, message: 'caseId required' });
      return;
    }
    const result = await bc.updateCaseStatus(caseId, status, note || '');
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId } = req.params;
    const data = await bc.getCase(caseId);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId } = req.params;
    const data = await bc.getCaseLogs(caseId);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
