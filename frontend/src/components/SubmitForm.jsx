import { useState } from "react";
import { submitCase } from "../api/caseApi";

export default function SubmitForm({ onSubmitted }) {
  const [citizenId, setCitizenId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!citizenId.trim() || !file) {
      alert("Nhập citizenId và chọn file.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("citizenId", citizenId);
      formData.append("description", description);
      formData.append("file", file);

      const res = await submitCase(formData);
      setResult(res.data);
      onSubmitted && onSubmitted(res.data);
    } catch (e) {
      console.error(e);
      alert("Submit lỗi: " + (e?.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Nộp hồ sơ (Công dân)</h3>
      <input placeholder="Citizen ID" value={citizenId} onChange={e=>setCitizenId(e.target.value)} />
      <br/><br/>
      <textarea placeholder="Mô tả" value={description} onChange={e=>setDescription(e.target.value)} rows={3} style={{width:"100%"}} />
      <br/><br/>
      <input type="file" onChange={handleFileChange} />
      <br/><br/>
      <button onClick={handleSubmit} disabled={loading}>{loading ? "Đang gửi..." : "Nộp hồ sơ"}</button>

      {result && (
        <div style={{ marginTop: 12, background: "#f6f6f6", padding: 8, borderRadius: 6 }}>
          <div><strong>Case ID:</strong> {result.caseId}</div>
          <div><strong>TxHash:</strong> <code>{result.txHash}</code></div>
          <div><strong>FileHash:</strong> <code>{result.fileHash}</code></div>
          {result.txHash && (
            <div style={{marginTop:6}}>
              <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer">Open on Sepolia Etherscan</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
