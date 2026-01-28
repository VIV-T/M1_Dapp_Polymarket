import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import CreateMarketModal from "../market/CreateMarketModal";

export default function Sidebar({ isConnected, account }) {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  // OPTIONAL: To hide admin menu for non-oracle users, replace with a check like:
  // const isOracle = account?.toLowerCase() === "your_oracle_address".toLowerCase();
  const isOracle = isConnected; 

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-title">Menu</div>
        <nav className="sidebar-nav">
          <Link 
            to="/global/active" 
            className={`sidebar-link ${location.pathname.includes('/global') ? 'active' : ''}`}
          >
            🌐 Global View
          </Link>

          {isConnected ? (
            <>
              <Link 
                to="/personal/active" 
                className={`sidebar-link ${location.pathname.includes('/personal') ? 'active' : ''}`}
              >
                👤 My Profile
              </Link>

              {/* ADMIN SECTION */}
              <div style={{ margin: '20px 0 10px 15px', fontSize: '10px', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>
                ADMINISTRATION
              </div>
              <Link 
                to="/admin/oracle" 
                className={`sidebar-link ${location.pathname.includes('/admin/oracle') ? 'active' : ''}`}
                style={{ color: '#4ade80' }} // Distinct color for admin
              >
                ⚖️ Oracle Validation
              </Link>
            </>
          ) : (
            <div className="sidebar-link-disabled">
              🔒 Profile (Please connect)
            </div>
          )}
        </nav>
      </div>

      {/* FAB Button - Create Market */}
      <div className="fab-container">
        <button 
          className={`btn-create-fab ${!isConnected ? 'fab-locked' : ''}`}
          onClick={() => isConnected ? setShowModal(true) : alert("Connect MetaMask to create a Bet")}
          title="Create a new market"
        >
          {isConnected ? "+" : "🔒"}
        </button>
      </div>

      {showModal && (
        <CreateMarketModal 
          onClose={() => setShowModal(false)} 
          onRefresh={() => window.location.reload()} 
        />
      )}
    </>
  );
}