import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { initWeb3 } from "../../utils/web3";
import MarketCard from "./MarketCard";

export default function Panel({ view, account }) {
  const { status } = useParams();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBlockchainData = useCallback(async () => {
    try {
      // STEP 1: initialize contract instance
      const { predictionMarket } = await initWeb3();
      
      // Get total number of markets
      const marketCount = await predictionMarket.methods.nextMarketId().call();
      const now = Math.floor(Date.now() / 1000);
      
      const loadedMarkets = [];

      // STEP 2: fetch data for each market
      for (let i = 0; i < marketCount; i++) {
        const m = await predictionMarket.methods.markets(i).call();
        
        let userStake = "0";
        let userStakeChoice = null;

        // If user connected, fetch their specific bet
        if (account) {
          try {
            const bet = await predictionMarket.methods.userBets(i, account).call();
            userStake = bet.amount.toString();
            userStakeChoice = bet.choice;
          } catch (e) {
            console.error(`Error loading market bet ${i}:`, e);
          }
        }

        const endTime = Number(m.endTime);
        const stage = parseInt(m.stage); // 0: Active, 1: Pending, 2: Resolved
        const isResolved = stage === 2;
        const isExpired = now >= endTime;

        // FILTERING LOGIC
        let shouldShow = false;

        if (status === "active") {
          // Active: not expired and not resolved
          shouldShow = !isExpired && stage !== 2;
        } else if (status === "pending") {
          // Pending: expired but not resolved
          shouldShow = isExpired && stage !== 2;
        } else if (status === "resolved") {
          // Resolved markets
          shouldShow = isResolved;
        } else if (!status) {
          // No status filter: show all
          shouldShow = true;
        }

        // Additional filter for PERSONAL view: only show markets where user staked
        if (view === "PERSONAL" && (userStake === "0" || !userStake)) {
          shouldShow = false;
        }

        if (shouldShow) {
          loadedMarkets.push({ 
            ...m, 
            id: i, // id used for actions like claim
            userStake, 
            userStakeChoice: userStake !== "0" ? parseInt(userStakeChoice) : null 
          });
        }
      }
      
      // Show newest first
      setMarkets(loadedMarkets.reverse());
    } catch (error) {
      console.error("Panel error while fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [status, view, account]);

  useEffect(() => {
    setLoading(true);
    loadBlockchainData();
    
    // Auto-refresh every 20 seconds
    const interval = setInterval(loadBlockchainData, 20000); 
    return () => clearInterval(interval);
  }, [loadBlockchainData, account]);

  if (loading) {
    return (
      <div className="loader" style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
        Loading markets...
      </div>
    );
  }

  return (
    <div className="panel-container">
      <h2 className="panel-title" style={{ color: 'white', marginBottom: '20px' }}>
        {view === "PERSONAL" ? "My Bets" : "Markets"} 
        <span style={{ fontSize: '0.6em', marginLeft: '10px', opacity: 0.6 }}>
          {status ? `(${status.toUpperCase()})` : ""}
        </span>
      </h2>
      
      {markets.length === 0 ? (
        <div className="empty-state" style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666', 
          background: '#1e1e1e', 
          borderRadius: '12px',
          border: '1px dashed #333'
        }}>
          No markets found in this category.
        </div>
      ) : (
        <div className="panel-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '20px' 
        }}>
          {markets.map((m) => (
            <MarketCard 
              key={m.id} 
              market={m} 
              account={account} 
              refresh={loadBlockchainData} 
            />
          ))}
        </div>
      )}
    </div>
  );
}