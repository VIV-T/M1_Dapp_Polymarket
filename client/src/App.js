import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MarketTabs from "./components/market/MarketTabs";
import Panel from "./components/market/Panel";
import OracleAdmin from "./components/market/OracleAdmin"; // Admin page import
import "./App.css";

export default function App() {
  const [account, setAccount] = useState(null);

  // 1. AUTO-LOGIN: check if MetaMask is already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };
    checkConnection();

    // Listen for account or network changes in MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Reload page on network change
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <Router>
      <div className="app-layout">
        {/* pass account state to control Sidebar links */}
        <Sidebar isConnected={!!account} account={account} /> 
        
        <div className="main-content">
          {/* Header handles connect/diconnect */}
          <Header account={account} setAccount={setAccount} />
          
          <div className="content-wrapper">
            {/* Navigation tabs (Active / Pending / Resolved) */}
            <MarketTabs />
            
            <Routes>
              {/* Public and personal views */}
              <Route path="/global/:status" element={<Panel view="GLOBAL" account={account} />} />
              <Route path="/personal/:status" element={<Panel view="PERSONAL" account={account} />} />
              
              {/* ADMIN ORACLE PAGE: validate results with signature */}
              <Route path="/admin/oracle" element={<OracleAdmin account={account} />} />

              {/* Default redirect to active markets */}
              <Route path="/" element={<Navigate to="/global/active" replace />} />
              
              {/* Catch-all to avoid broken routes */}
              <Route path="*" element={<Navigate to="/global/active" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}