import React, { useState } from "react";
import { initWeb3 } from "../../utils/web3";

export default function CreateMarketModal({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    title: "",
    optionA: "",
    optionB: "",
    duration: 3600,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { predictionMarket, web3 } = await initWeb3();
      const accounts = await web3.eth.getAccounts();

      await predictionMarket.methods
        .createMarket(
          formData.title,
          formData.optionA,
          formData.optionB,
          parseInt(formData.duration)
        )
        .send({ from: accounts[0] });

      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("The transaction failed.");
    }
  };

  const inputStyle = {
    backgroundColor: "#2d2d2d",
    border: "1px solid #444",
    borderRadius: "8px",
    padding: "12px",
    color: "white",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "5px"
  };

  const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "#888", marginLeft: "2px" };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div className="modal-content" style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '16px', width: '450px', border: '1px solid #333' }}>
        <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.5rem' }}>🚀 New Market</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>QUESTION</label>
            <input
              style={inputStyle}
              placeholder="e.g.: Will Bitcoin hit $100k?"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, color: '#3b82f6' }}>OPTION A</label>
              <input
                style={inputStyle}
                placeholder="e.g.: YES"
                onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, color: '#ec4899' }}>OPTION B</label>
              <input
                style={inputStyle}
                placeholder="e.g.: NO"
                onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>DURATION (SECONDS)</label>
            <input
              type="number"
              style={inputStyle}
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: 'white', border: '1px solid #444' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold' }}>
              Deploy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}