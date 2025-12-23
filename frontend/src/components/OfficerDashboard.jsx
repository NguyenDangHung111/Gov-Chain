import { useState, useEffect } from "react";
import { getAllCases, updateStatus, getCaseLogs, getCase } from "../api/caseApi";

// Mapping status theo API mới
const STATUS_MAP = {
  0: 'Đã nộp',
  1: 'Đang xử lý',
  2: 'Yêu cầu bổ sung',
  3: 'Đã duyệt',
  4: 'Từ chối',
  5: 'Hoàn thành'
};

const STATUS_LIST = Object.entries(STATUS_MAP).map(([key, value]) => ({ id: Number(key), name: value }));

const formatDate = (data) => {
  let timestamp = data;
  if (data && typeof data === 'object') {
    timestamp = data.timestamp || data.createdAt || data.created_at || data.date || data.time;
  }
  if (!timestamp) return "Chưa cập nhật";
  let date;
  const num = Number(timestamp);
  if (!isNaN(num) && num > 0) {
    date = new Date(num < 10000000000 ? num * 1000 : num);
  } else {
    date = new Date(timestamp);
  }
  if (date.toString() === "Invalid Date") return "Lỗi định dạng ngày";
  return date.toLocaleString('vi-VN');
};

const translateNote = (note) => {
  if (!note) return "";
  return note
    .replace(/Submitted/gi, 'Đã nộp')
    .replace(/Received/gi, 'Đã tiếp nhận')
    .replace(/Assigned/gi, 'Đã phân công')
    .replace(/Processing/gi, 'Đang xử lý')
    .replace(/Approved/gi, 'Đã duyệt')
    .replace(/Rejected/gi, 'Từ chối');
};

export default function OfficerDashboard({ user }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Detail view state
  const [logs, setLogs] = useState([]);
  const [newStatus, setNewStatus] = useState(1);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await getAllCases();
      setCases(res.data.data || []);
    } catch (e) {
      console.error(e);
      alert("Lỗi tải danh sách hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = async (caseItem) => {
    setNewStatus(Number(caseItem.status));
    setNote("");
    try {
      // Gọi API chi tiết để lấy đầy đủ thông tin bao gồm userInfo
      const caseRes = await getCase(caseItem.id);
      const caseDetail = caseRes.data.data || caseRes.data;
      console.log("Case detail:", caseDetail);
      setSelectedCase(caseDetail);
      setNewStatus(Number(caseDetail.status));
      
      // Lấy logs
      const res = await getCaseLogs(caseItem.id);
      console.log("Logs response:", res);
      console.log("Logs data:", res.data);
      setLogs(res.data.data || res.data || []);
    } catch (e) {
      console.error("Error loading logs:", e);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedCase) return;
    setProcessing(true);
    try {
      await updateStatus(selectedCase.id, { 
        status: Number(newStatus), 
        note,
        officerId: user.id 
      });
      alert("Cập nhật trạng thái thành công!");
      await loadCases(); // Reload list
      
      // Update local selected case status to reflect change immediately or close detail
      setSelectedCase(prev => ({...prev, status: newStatus}));
      
      // Reload logs
      const res = await getCaseLogs(selectedCase.id);
      setLogs(res.data.data || []);
      
    } catch (e) {
      console.error(e);
      alert("Lỗi cập nhật: " + (e?.response?.data?.message || e.message));
    } finally {
      setProcessing(false);
    }
  };

  const filteredCases = cases.filter(c => {
    if (filterStatus === "all") return true;
    return c.status.toString() === filterStatus;
  });

  return (
    <div className="officer-dashboard">
      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 10 }}>
        <h2>Hệ Thống Quản Lý Hồ Sơ</h2>
        <p style={{ color: "#666" }}>Cán bộ: <strong>{user.name}</strong></p>
      </div>

      {selectedCase ? (
        <div className="case-detail-view">
            <div style={{textAlign: 'left'}}>
              <button 
                onClick={() => setSelectedCase(null)} 
                style={{
                  marginBottom: 20, 
                  padding: '10px 18px', 
                  cursor: 'pointer',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                  color: '#555',
                  transition: 'all 0.2s',
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#adb5bd';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                <span style={{fontSize: 18}}>←</span> Quay lại danh sách
              </button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
                {/* Left Column: Info */}
                <div style={{backgroundColor: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                    <h3 style={{marginTop: 0}}>Thông tin hồ sơ #{selectedCase.id}</h3>
                    
                    <div style={{marginBottom: 20, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 6}}>
                        <h4 style={{marginTop: 0, marginBottom: 10, textAlign: 'left'}}>Người nộp hồ sơ</h4>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left'}}>
                            <div><strong>Họ tên:</strong> {selectedCase.userInfo?.fullName || "Chưa cập nhật"}</div>
                            <div><strong>CCCD:</strong> {selectedCase.citizenId}</div>
                            <div><strong>Ngày sinh:</strong> {selectedCase.userInfo?.dob || "Chưa cập nhật"}</div>
                            <div><strong>Nghề nghiệp:</strong> {selectedCase.userInfo?.job || "Chưa cập nhật"}</div>
                            <div style={{gridColumn: '1/-1'}}><strong>Địa chỉ:</strong> {selectedCase.userInfo?.address || "Chưa cập nhật"}</div>
                        </div>
                    </div>

                    <div style={{marginBottom: 20, textAlign: 'left'}}>
                        <p><strong>Mô tả hồ sơ:</strong> {selectedCase.description}</p>
                        <p><strong>Ngày nộp:</strong> {formatDate(selectedCase)}</p>
                        <div style={{marginTop: 15}}>
                          <strong>File đính kèm:</strong>
                          <div style={{marginTop: 10, display: 'flex', gap: 10}}>
                            <button
                              onClick={() => setShowFilePreview(true)}
                              style={{
                                padding: '10px 16px',
                                backgroundColor: '#f0f8ff',
                                color: '#007bff',
                                border: '1px solid #cce5ff',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8
                              }}
                            >
                              👁️ Xem trước văn bản
                            </button>
                            <a 
                              href={`https://ipfs.io/ipfs/${selectedCase.fileHash}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{
                                padding: '10px 16px',
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                border: '1px solid #c8e6c9',
                                borderRadius: 8,
                                textDecoration: 'none',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8
                              }}
                            >
                              🔗 Mở trong tab mới
                            </a>
                          </div>
                        </div>
                    </div>

                    {/* File Preview Modal */}
                    {showFilePreview && (
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                      }}>
                        <div style={{
                          backgroundColor: '#fff',
                          borderRadius: 12,
                          width: '90%',
                          maxWidth: 900,
                          height: '85vh',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            padding: '15px 20px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8f9fa'
                          }}>
                            <h4 style={{margin: 0}}>📄 Xem trước tài liệu đính kèm</h4>
                            <button
                              onClick={() => setShowFilePreview(false)}
                              style={{
                                border: 'none',
                                background: 'none',
                                fontSize: 24,
                                cursor: 'pointer',
                                color: '#666',
                                padding: '5px 10px'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          <div style={{flex: 1, overflow: 'auto', padding: 0}}>
                            <iframe
                              src={`https://ipfs.io/ipfs/${selectedCase.fileHash}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                              }}
                              title="File Preview"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <h4 style={{borderTop: '1px solid #eee', paddingTop: 15}}>Lịch sử xử lý ({logs.length} bản ghi)</h4>
                    {logs.length === 0 ? (
                      <p style={{color: '#999', fontStyle: 'italic', textAlign: 'left'}}>Chưa có lịch sử xử lý</p>
                    ) : (
                      <ul style={{paddingLeft: 20, textAlign: 'left'}}>
                          {logs.map((l, idx) => {
                              const statusNum = Number(l.status);
                              const statusIcon = statusNum === 0 ? '📋' : statusNum === 3 || statusNum === 5 ? '✅' : statusNum === 4 ? '❌' : '🔄';
                              return (
                              <li key={idx} style={{marginBottom: 15, paddingBottom: 15, borderBottom: idx < logs.length - 1 ? '1px dashed #eee' : 'none'}}>
                                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5}}>
                                    <strong style={{color: '#007bff'}}>
                                      {statusIcon} {STATUS_MAP[statusNum] || `Trạng thái ${statusNum}`}
                                    </strong>
                                    <span style={{fontSize: 12, color: '#999'}}>{formatDate(l)}</span>
                                  </div>
                                  <div style={{color: '#666', fontSize: 13}}>
                                    <span>Bởi: </span>
                                    <strong>{l.actorName || 'Hệ thống'}</strong>
                                    {l.actorCitizenId && <span style={{color: '#888'}}> ({l.actorCitizenId})</span>}
                                  </div>
                                  {l.note && (
                                    <div style={{marginTop: 6, padding: '6px 10px', backgroundColor: '#f8f9fa', borderLeft: '3px solid #ddd', fontStyle: 'italic', fontSize: 13}}>
                                      Ghi chú: {translateNote(l.note)}
                                    </div>
                                  )}
                              </li>
                              );
                          })}
                      </ul>
                    )}
                </div>

                {/* Right Column: Action */}
                <div style={{backgroundColor: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', height: 'fit-content'}}>
                    <h3 style={{marginTop: 0}}>Xử lý hồ sơ</h3>
                    <div style={{marginBottom: 15}}>
                        <label style={{display: 'block', marginBottom: 5, fontWeight: 'bold'}}>Trạng thái mới</label>
                        <select 
                            style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd'}}
                            value={newStatus}
                            onChange={e => setNewStatus(e.target.value)}
                        >
                            {STATUS_LIST.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{marginBottom: 15}}>
                        <label style={{display: 'block', marginBottom: 5, fontWeight: 'bold'}}>Ghi chú / Lý do</label>
                        <textarea 
                            style={{width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', minHeight: 80}}
                            placeholder="Nhập ghi chú xử lý..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleUpdateStatus}
                        disabled={processing}
                        style={{
                            width: '100%', 
                            padding: 10, 
                            backgroundColor: '#28a745', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 4, 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {processing ? "Đang xử lý..." : "Cập nhật trạng thái"}
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <div className="case-list-view">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                <h3>Danh sách hồ sơ ({filteredCases.length})</h3>
                <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd'}}
                >
                    <option value="all">Tất cả trạng thái</option>
                    {STATUS_LIST.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {loading ? <p>Đang tải dữ liệu...</p> : (
                <table style={{width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <thead>
                        <tr style={{backgroundColor: '#f8f9fa', textAlign: 'left'}}>
                            <th style={{padding: 12, borderBottom: '2px solid #dee2e6'}}>ID</th>
                            <th style={{padding: 12, borderBottom: '2px solid #dee2e6'}}>Người nộp</th>
                            <th style={{padding: 12, borderBottom: '2px solid #dee2e6'}}>Mô tả</th>
                            <th style={{padding: 12, borderBottom: '2px solid #dee2e6'}}>Ngày nộp</th>
                            <th style={{padding: 12, borderBottom: '2px solid #dee2e6'}}>Trạng thái</th>
                            <th style={{padding: 12, borderBottom: '2px solid #dee2e6'}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCases.map(c => {
                            const statusNum = Number(c.status);
                            // Màu sắc: 3=Đã duyệt, 5=Hoàn thành -> xanh lá; 4=Từ chối -> đỏ; còn lại -> xám
                            const isSuccess = statusNum === 3 || statusNum === 5;
                            const isReject = statusNum === 4;
                            return (
                            <tr key={c.id} style={{borderBottom: '1px solid #dee2e6'}}>
                                <td style={{padding: 12}}>#{c.id}</td>
                                <td style={{padding: 12}}>
                                    <strong>{c.userInfo?.fullName || c.citizenId}</strong>
                                </td>
                                <td style={{padding: 12}}>{c.description.length > 40 ? c.description.substring(0,40)+'...' : c.description}</td>
                                <td style={{padding: 12}}>{formatDate(c)}</td>
                                <td style={{padding: 12}}>
                                    <span style={{
                                        padding: '4px 8px', 
                                        borderRadius: 4, 
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                        backgroundColor: isSuccess ? '#d4edda' : isReject ? '#f8d7da' : '#e2e3e5',
                                        color: isSuccess ? '#155724' : isReject ? '#721c24' : '#383d41'
                                    }}>
                                        {STATUS_MAP[statusNum] || `Trạng thái ${statusNum}`}
                                    </span>
                                </td>
                                <td style={{padding: 12}}>
                                    <button 
                                        onClick={() => handleViewCase(c)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#007bff',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Xử lý
                                    </button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
      )}
    </div>
  );
}
