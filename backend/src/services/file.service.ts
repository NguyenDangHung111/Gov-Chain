import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';

// Hash content using SHA256
export const hashContent = (content: string | Buffer): string => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

export const uploadToIpfs = async (fileBuffer: Buffer): Promise<string> => {
  const ipfsUrl = process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0/add';
  try {
    const formData = new FormData();
    formData.append('file', fileBuffer, 'upload.file');

    const response = await axios.post(ipfsUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    if (response.data && response.data.Hash) {
      return response.data.Hash;
    }
    throw new Error('No Hash returned from IPFS');
  } catch (error: any) {
    console.error('IPFS upload failed:', error.message);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};
