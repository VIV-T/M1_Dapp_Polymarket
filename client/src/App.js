import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MarketTabs from "./components/market/MarketTabs";
import Panel from "./components/market/Panel";
import "./App.css";

export default function App() {
  const [account, setAccount] = useState(null);

  // 1. AUTO-LOGIN: check if MetaMask is already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };
    checkConnection();

    // Listen for account changes in MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  return (
    <Router>
      <div className="app-layout">
        {/* pass account state so the Sidebar knows if user is connected */}
        <Sidebar isConnected={!!account} /> 
        
        <div className="main-content">
          {/* pass account and setAccount so Header can connect the user */}
          <Header account={account} setAccount={setAccount} />
          
          <div className="content-wrapper">
            <MarketTabs />
            <Routes>
              <Route path="/global/:status" element={<Panel view="GLOBAL" account={account} />} />
              <Route path="/personal/:status" element={<Panel view="PERSONAL" account={account} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}