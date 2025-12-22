import { useState, useEffect } from "react";
import { submitCase, getCasesByCitizen, getCaseLogs } from "../api/caseApi";
import "../CitizenDashboard.css";

const SERVICES = [
  { id: 'birth_cert', name: 'Đăng ký khai sinh', desc: 'Thủ tục đăng ký khai sinh cho trẻ em mới sinh.' },
  { id: 'marriage_cert', name: 'Đăng ký kết hôn', desc: 'Thủ tục đăng ký kết hôn cho công dân.' },
  { id: 'land_rights', name: 'Cấp GCN quyền sử dụng đất', desc: 'Thủ tục cấp mới hoặc cấp đổi giấy chứng nhận QSDĐ.' },
  { id: 'business_reg', name: 'Đăng ký kinh doanh', desc: 'Thủ tục đăng ký thành lập hộ kinh doanh hoặc doanh nghiệp.' },
  { id: 'id_card', name: 'Cấp đổi CCCD', desc: 'Thủ tục cấp đổi thẻ Căn cước công dân gắn chip.' },
];

const PROFILE_VIEW = { id: 'profile', name: 'Thông tin cá nhân', desc: 'Xem thông tin chi tiết của công dân.' };
const HISTORY_VIEW = { id: 'history', name: 'Lịch sử hồ sơ', desc: 'Theo dõi trạng thái các hồ sơ đã nộp.' };

export default function CitizenDashboard({ user }) {
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [citizenId, setCitizenId] = useState(user?.citizenId || "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [historyCases, setHistoryCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseLogs, setCaseLogs] = useState([]);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  // Reset form when service changes
  const handleServiceChange = (service) => {
    setSelectedService(service);
    setDescription(`Hồ sơ xin ${service.name.toLowerCase()}`);
    setResult(null);
    setFileName("");
    setFileContent("");
    setSelectedFile(null);
    setSelectedCase(null);
  };

  useEffect(() => {
    if (selectedService.id === 'history') {
      loadHistory();
    }
  }, [selectedService]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getCasesByCitizen(user.citizenId);
      setHistoryCases(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = async (caseItem) => {
    setSelectedCase(caseItem);
    try {
      const res = await getCaseLogs(caseItem.id);
      setCaseLogs(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.");
        e.target.value = null; // Reset input
        setFileName("");
        setFileContent("");
        setSelectedFile(null);
        return;
      }
      setFileName(file.name);
      setSelectedFile(file);

      // Read file for preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFileContent(ev.target.result);
      };

      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  const formatDate = (data) => {
    // Try to find a valid date field if an object is passed
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

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!citizenId.trim() || !selectedFile) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    setLoading(true);
    try {
      // Combine service name into description for clarity
      const fullDescription = `[${selectedService.name}] ${description}`;
      
      const formData = new FormData();
      formData.append("citizenId", citizenId);
      formData.append("description", fullDescription);
      formData.append("file", selectedFile);
      
      const res = await submitCase(formData);
      
      setResult(res.data);
    } catch (e) {
      console.error(e);
      alert("Lỗi nộp hồ sơ: " + (e?.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-dashboard">
      <div className="sidebar">
        <h3>Dịch Vụ Công</h3>
        <ul className="service-list">
          {SERVICES.map((service) => (
            <li 
              key={service.id} 
              className={`service-item ${selectedService.id === service.id ? 'active' : ''}`}
              onClick={() => handleServiceChange(service)}
            >
              {service.name}
              <span>›</span>
            </li>
          ))}
        </ul>

        <h3 style={{marginTop: 20, borderTop: '1px solid #eee', paddingTop: 20}}>Tài Khoản</h3>
        <ul className="service-list">
           <li 
              className={`service-item ${selectedService.id === PROFILE_VIEW.id ? 'active' : ''}`}
              onClick={() => handleServiceChange(PROFILE_VIEW)}
            >
              {PROFILE_VIEW.name}
              <span>›</span>
            </li>
            <li 
              className={`service-item ${selectedService.id === HISTORY_VIEW.id ? 'active' : ''}`}
              onClick={() => handleServiceChange(HISTORY_VIEW)}
            >
              {HISTORY_VIEW.name}
              <span>›</span>
            </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="form-header">
          <h2>{selectedService.name}</h2>
          <p className="form-subtitle">{selectedService.desc}</p>
        </div>

        {selectedService.id === 'profile' ? (
          <div className="profile-container" style={{padding: 20, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                <div>
                    <label style={{fontWeight: 'bold', color: '#666', display: 'block', marginBottom: 5, textAlign: 'left'}}>Họ và tên</label>
                    <div style={{padding: 10, background: '#f9f9f9', borderRadius: 4, textAlign: 'left'}}>{user.name}</div>
                </div>
                <div>
                    <label style={{fontWeight: 'bold', color: '#666', display: 'block', marginBottom: 5, textAlign: 'left'}}>Mã định danh</label>
                    <div style={{padding: 10, background: '#f9f9f9', borderRadius: 4, textAlign: 'left'}}>{user.citizenId}</div>
                </div>
                <div>
                    <label style={{fontWeight: 'bold', color: '#666', display: 'block', marginBottom: 5, textAlign: 'left'}}>Ngày sinh</label>
                    <div style={{padding: 10, background: '#f9f9f9', borderRadius: 4, textAlign: 'left'}}>{user.dob}</div>
                </div>
                <div>
                    <label style={{fontWeight: 'bold', color: '#666', display: 'block', marginBottom: 5, textAlign: 'left'}}>Nghề nghiệp</label>
                    <div style={{padding: 10, background: '#f9f9f9', borderRadius: 4, textAlign: 'left'}}>{user.job}</div>
                </div>
                <div style={{gridColumn: '1 / -1'}}>
                    <label style={{fontWeight: 'bold', color: '#666', display: 'block', marginBottom: 5, textAlign: 'left'}}>Địa chỉ</label>
                    <div style={{padding: 10, background: '#f9f9f9', borderRadius: 4, textAlign: 'left'}}>{user.address}</div>
                </div>
             </div>
          </div>
        ) : selectedService.id === 'history' ? (
          <div className="history-container">
            {selectedCase ? (
              <div className="case-detail">
                <button 
                  onClick={() => setSelectedCase(null)} 
                  style={{
                    marginBottom: 20, 
                    padding: '8px 16px', 
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontWeight: 500
                  }}
                >
                  ← Quay lại danh sách
                </button>
                
                <div style={{padding: 30, backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                  <div style={{borderBottom: '1px solid #eee', paddingBottom: 15, marginBottom: 20}}>
                    <h3 style={{margin: 0, color: '#333'}}>📄 Chi tiết hồ sơ #{selectedCase.id}</h3>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    columnGap: 20,
                    rowGap: 14,
                    alignItems: 'start',
                    marginBottom: 30
                  }}>
                    <div style={{fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: 3, textAlign: 'left'}}>Ngày nộp</div>
                    <div style={{fontSize: 16, textAlign: 'left'}}>{formatDate(selectedCase)}</div>

                    <div style={{fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: 6, textAlign: 'left'}}>Trạng thái</div>
                    <div style={{textAlign: 'left'}}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        backgroundColor: ["#e2e3e5", "#cce5ff", "#fff3cd", "#d1ecf1", "#d4edda", "#f8d7da"][Number(selectedCase.status)],
                        color: ["#383d41", "#004085", "#856404", "#0c5460", "#155724", "#721c24"][Number(selectedCase.status)]
                      }}>
                        {["Đã nộp", "Đã tiếp nhận", "Đã phân công", "Đang xử lý", "Đã duyệt", "Từ chối"][Number(selectedCase.status)]}
                      </span>
                    </div>

                    <div style={{fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: 10, textAlign: 'left'}}>Nội dung</div>
                    <div style={{padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, lineHeight: 1.6, textAlign: 'left'}}>
                      {selectedCase.description}
                    </div>

                    <div style={{fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: 10, textAlign: 'left'}}>Tài liệu</div>
                    <div style={{textAlign: 'left'}}>
                      {selectedCase.fileHash ? (
                        <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
                          <button
                            onClick={() => setShowFilePreview(true)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '12px 16px',
                              backgroundColor: '#f0f8ff',
                              color: '#007bff',
                              border: '1px solid #cce5ff',
                              borderRadius: 8,
                              fontWeight: 600,
                              cursor: 'pointer',
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '12px 16px',
                              backgroundColor: '#e8f5e9',
                              color: '#2e7d32',
                              textDecoration: 'none',
                              borderRadius: 8,
                              fontWeight: 600,
                              border: '1px solid #c8e6c9',
                              gap: 8
                            }}
                          >
                            🔗 Mở trong tab mới
                          </a>
                        </div>
                      ) : (
                        <span style={{color: '#999', fontStyle: 'italic'}}>Không có tài liệu đính kèm</span>
                      )}
                    </div>

                    {/* File Preview Modal */}
                    {showFilePreview && selectedCase.fileHash && (
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
                  </div>
                  
                  <h4 style={{borderLeft: '4px solid #007bff', paddingLeft: 10, margin: '30px 0 15px'}}>Lịch sử xử lý</h4>
                  <div style={{position: 'relative', paddingLeft: 20}}>
                    <div style={{position: 'absolute', left: 0, top: 10, bottom: 10, width: 2, backgroundColor: '#eee'}}></div>
                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                      {caseLogs.map((log, idx) => (
                        <li key={idx} style={{marginBottom: 20, position: 'relative'}}>
                          <div style={{
                            position: 'absolute', 
                            left: -24, 
                            top: 0, 
                            width: 10, 
                            height: 10, 
                            borderRadius: '50%', 
                            backgroundColor: Number(log.status) === 4 ? '#28a745' : Number(log.status) === 5 ? '#dc3545' : '#007bff',
                            border: '2px solid white',
                            boxShadow: `0 0 0 2px ${Number(log.status) === 4 ? '#28a745' : Number(log.status) === 5 ? '#dc3545' : '#007bff'}`
                          }}></div>
                          <div style={{backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 5}}>
                              <strong style={{color: Number(log.status) === 4 ? '#28a745' : Number(log.status) === 5 ? '#dc3545' : '#007bff'}}>
                                {Number(log.status) === 0 ? '📋' : Number(log.status) === 4 ? '✅' : Number(log.status) === 5 ? '❌' : '🔄'} {["Đã nộp", "Đã tiếp nhận", "Đã phân công", "Đang xử lý", "Đã duyệt", "Từ chối"][Number(log.status)]}
                              </strong>
                              <span style={{fontSize: 12, color: '#999'}}>
                                {formatDate(log)}
                              </span>
                            </div>
                            <div style={{fontSize: 13, color: '#555'}}>
                              <span>Bởi: </span>
                              <strong>
                                {log.officer 
                                  ? `${log.officer.fullName} (${log.officer.job})` 
                                  : (Number(log.status) === 0 ? user.name : 'Hệ thống')
                                }
                              </strong>
                            </div>
                            {log.note && (
                              <div style={{marginTop: 8, padding: '8px 12px', backgroundColor: '#fff', borderLeft: '3px solid #ddd', fontStyle: 'italic', fontSize: 13, textAlign: 'left'}}>
                                Ghi chú: {log.note
                                  .replace(/Submitted/gi, 'Đã nộp')
                                  .replace(/Received/gi, 'Đã tiếp nhận')
                                  .replace(/Assigned/gi, 'Đã phân công')
                                  .replace(/Processing/gi, 'Đang xử lý')
                                  .replace(/Approved/gi, 'Đã duyệt')
                                  .replace(/Rejected/gi, 'Từ chối')
                                }
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee'}}>
                      <th style={{padding: '15px 20px', color: '#555', fontWeight: 600}}>Mã HS</th>
                      <th style={{padding: '15px 20px', color: '#555', fontWeight: 600}}>Nội dung</th>
                      <th style={{padding: '15px 20px', color: '#555', fontWeight: 600}}>Ngày nộp</th>
                      <th style={{padding: '15px 20px', color: '#555', fontWeight: 600}}>Trạng thái</th>
                      <th style={{padding: '15px 20px', color: '#555', fontWeight: 600}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyCases.length === 0 ? (
                      <tr><td colSpan={5} style={{padding: 40, textAlign: 'center', color: '#999'}}>Chưa có hồ sơ nào</td></tr>
                    ) : (
                      historyCases.map(c => (
                        <tr key={c.id} style={{borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s'}} className="hover-row">
                          <td style={{padding: '15px 20px', fontWeight: 500}}>#{c.id}</td>
                          <td style={{padding: '15px 20px', color: '#555'}}>{c.description.length > 50 ? c.description.substring(0,50)+'...' : c.description}</td>
                          <td style={{padding: '15px 20px', color: '#666'}}>{formatDate(c)}</td>
                          <td style={{padding: '15px 20px'}}>
                            <span style={{
                              padding: '6px 12px', 
                              borderRadius: 20, 
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: ["#e2e3e5", "#cce5ff", "#fff3cd", "#d1ecf1", "#d4edda", "#f8d7da"][Number(c.status)],
                              color: ["#383d41", "#004085", "#856404", "#0c5460", "#155724", "#721c24"][Number(c.status)]
                            }}>
                              {["Đã nộp", "Đã tiếp nhận", "Đã phân công", "Đang xử lý", "Đã duyệt", "Từ chối"][Number(c.status)]}
                            </span>
                          </td>
                          <td style={{padding: '15px 20px', textAlign: 'right'}}>
                            <button 
                              onClick={() => handleViewCase(c)} 
                              style={{
                                cursor: 'pointer', 
                                color: '#007bff', 
                                background: 'rgba(0,123,255,0.1)', 
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontWeight: 500,
                                fontSize: 13
                              }}
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
        <>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mã số định danh (CCCD/CMND) <span style={{color:'red'}}>*</span></label>
              <input 
                className="form-input" 
                placeholder="Nhập số CCCD của bạn" 
                value={citizenId} 
                onChange={e=>setCitizenId(e.target.value)} 
                required
                disabled={!!user?.citizenId}
                style={user?.citizenId ? {backgroundColor: '#f0f0f0'} : {}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Người nộp hồ sơ</label>
              <input 
                className="form-input" 
                value={user.name} 
                disabled 
                style={{backgroundColor: '#f0f0f0'}}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Nội dung chi tiết</label>
              <textarea 
                className="form-textarea" 
                rows={3} 
                placeholder="Mô tả thêm về hồ sơ..." 
                value={description} 
                onChange={e=>setDescription(e.target.value)} 
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Tài liệu đính kèm (PDF/Word/Image) <span style={{color:'red'}}>*</span></label>
              <div style={{border: '2px dashed #ddd', padding: 20, borderRadius: 8, textAlign: 'center', backgroundColor: '#fafafa'}}>
                <input 
                  type="file" 
                  id="file-upload"
                  onChange={handleFileChange}
                  style={{display: 'none'}}
                />
                <label htmlFor="file-upload" style={{cursor: 'pointer', display: 'block'}}>
                  <div style={{fontSize: 24, marginBottom: 10}}>📂</div>
                  <span style={{color: '#4a90e2', fontWeight: 600}}>
                    {fileName ? fileName : "Nhấn để chọn file hồ sơ"}
                  </span>
                  <p style={{margin: '5px 0 0', color: '#999', fontSize: 13}}>
                    {fileName ? "Đã chọn file thành công" : "Hỗ trợ các định dạng văn bản thông thường"}
                  </p>
                </label>
              </div>
              {fileContent && selectedFile && (
                <div style={{marginTop: 15, padding: 10, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                    <span style={{fontWeight: 'bold', fontSize: 14, color: '#555'}}>Xem trước tài liệu:</span>
                    <button 
                      type="button" 
                      onClick={() => {setFileContent(""); setFileName(""); setSelectedFile(null);}}
                      style={{border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontSize: 12}}
                    >
                      ❌ Xóa file
                    </button>
                  </div>
                  
                  {selectedFile.type.startsWith('image/') ? (
                    <img 
                      src={fileContent} 
                      alt="Preview" 
                      style={{maxWidth: '100%', height: 'auto', borderRadius: 4, display: 'block', margin: '0 auto'}} 
                    />
                  ) : selectedFile.type === 'application/pdf' ? (
                    <iframe 
                      src={fileContent} 
                      style={{width: '100%', height: '600px', border: 'none', borderRadius: 4}} 
                      title="PDF Preview"
                    ></iframe>
                  ) : (
                    <div style={{
                      maxHeight: '400px', 
                      overflow: 'auto', 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: 'Consolas, Monaco, monospace', 
                      fontSize: 13, 
                      padding: 15, 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      color: '#333'
                    }}>
                      {fileContent}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner">⏳</span> Đang xử lý...
              </>
            ) : (
              <>
                📤 Nộp Hồ Sơ
              </>
            )}
          </button>
        </form>

        {result && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: 40,
              borderRadius: 16,
              maxWidth: 350,
              width: '90%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              textAlign: 'center',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <button 
                onClick={() => setResult(null)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  border: 'none',
                  background: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
              
              <div style={{fontSize: 50, marginBottom: 10}}>✅</div>
              <h3 style={{marginTop:0, color: '#28a745', marginBottom: 20}}>Nộp hồ sơ thành công!</h3>

              {result.txHash && (
                <div style={{marginTop: 20}}>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${result.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: 6,
                      fontWeight: 'bold',
                      fontSize: 14
                    }}
                  >
                    🔍 Xem trên Etherscan
                  </a>
                </div>
              )}
              
              <button 
                onClick={() => setResult(null)}
                style={{
                  marginTop: 15,
                  padding: '8px 20px',
                  backgroundColor: '#eee',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#333',
                  fontWeight: 600
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
