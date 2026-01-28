import React, { useState, useEffect } from "react";
import { initWeb3 } from "../../utils/web3";
import { ethers } from "ethers";

export default function OracleAdmin({ account }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [markets, setMarkets] = useState([]);

  // --- SECURE CONFIG ---
  const ADMIN_PASSWORD = "1234"; 
  const ORACLE_PRIVATE_KEY = "0x4fa5d987c038d53576f05e74c6b587df9999d8993191efb78183628b5e450fe3"; 
  const CONTRACT_ADDRESS = "0x299c815d81a0504D249c2922f2f2357B47886C0E"; // Contract address
  // ---------------------

  const loadPendingMarkets = async () => {
    try {
      const { predictionMarket } = await initWeb3();
      const count = await predictionMarket.methods.nextMarketId().call();
      const now = Math.floor(Date.now() / 1000);
      let list = [];

      for (let i = 0; i < count; i++) {
        const m = await predictionMarket.methods.markets(i).call();
        // Show expired but unresolved markets
        if (parseInt(m.stage) < 2 && Number(m.endTime) < now) {
          list.push({ ...m, id: i });
        }
      }
      setMarkets(list);
    } catch (e) { console.error(e); }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthorized(true);
      loadPendingMarkets();
    } else {
      alert("Incorrect password");
    }
  };

  const resolve = async (marketId, outcome) => {
    try {
      // 1. Local signature (in browser)
      const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY);
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint8"],
        [CONTRACT_ADDRESS, marketId, outcome]
      );
      const signature = await wallet.signMessage(ethers.getBytes(messageHash));

      // 2. Send to contract
      const { predictionMarket } = await initWeb3();
      await predictionMarket.methods
        .resolveMarket(marketId, outcome, signature)
        .send({ from: account });

      alert("Market resolved successfully!");
      loadPendingMarkets();
    } catch (e) {
      console.error(e);
      alert("Error resolving market.");
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'white' }}>
        <h3>Oracle-only area</h3>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="Admin password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: 'none', marginRight: '10px' }}
          />
          <button type="submit" className="btn-primary">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <h2>⚖️ Oracle Control Panel</h2>
      <p>Connected as: {account}</p>
      <hr style={{ opacity: 0.2, margin: '20px 0' }} />
      
      {markets.length === 0 ? (
        <p>No pending markets to resolve.</p>
      ) : (
        markets.map(m => (
          <div key={m.id} style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
            <h4>{m.title}</h4>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => resolve(m.id, 0)} style={{ flex: 1, backgroundColor: '#3b82f6' }} className="btn-bet">
                Confirm: {m.optionA}
              </button>
              <button onClick={() => resolve(m.id, 1)} style={{ flex: 1, backgroundColor: '#ec4899' }} className="btn-bet">
                Confirm: {m.optionB}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}