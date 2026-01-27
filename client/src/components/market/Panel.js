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
      // STEP 1: Single initialization of the contract before the loop
      const { predictionMarket } = await initWeb3();
      
      const marketCount = await predictionMarket.methods.nextMarketId().call();
      const now = Math.floor(Date.now() / 1000);
      
      const loadedMarkets = [];

      // STEP 2: Loop to fetch data
      for (let i = 0; i < marketCount; i++) {
        // Use the same 'predictionMarket' instance for each call
        const m = await predictionMarket.methods.markets(i).call();
        
        let userStake = "0";
        let userStakeChoice = null;

        if (account) {
          try {
            // Direct call without reinitializing Web3
            const bet = await predictionMarket.methods.userBets(i, account).call();
            userStake = bet.amount.toString();
            userStakeChoice = bet.choice;
          } catch (e) {
            console.error(`Error loading market bet ${i}:`, e);
          }
        }

        const endTime = Number(m.endTime);
        const isResolved = parseInt(m.stage) === 2;
        const isExpired = now >= endTime;

        // FILTERING
        let shouldShow = false;
        if (status === "active") {
          shouldShow = !isExpired && !isResolved;
        } else if (status === "pending") {
          shouldShow = isExpired && !isResolved;
        } else if (status === "resolved") {
          shouldShow = isResolved;
        }

        if (view === "PERSONAL" && (userStake === "0" || !userStake)) {
          shouldShow = false;
        }

        if (shouldShow) {
          loadedMarkets.push({ 
            ...m, 
            id: i, // Unique index for claim
            userStake, 
            userStakeChoice: userStake !== "0" ? parseInt(userStakeChoice) : null 
          });
        }
      }
      
      setMarkets(loadedMarkets.reverse());
    } catch (error) {
      console.error("Panel error:", error);
    } finally {
      setLoading(false);
    }
  }, [status, view, account]);

  useEffect(() => {
    setLoading(true);
    loadBlockchainData();
    
    // Safety interval to refresh data
    const interval = setInterval(loadBlockchainData, 20000); 
    return () => clearInterval(interval);
  }, [loadBlockchainData, account]);

  if (loading) return <div className="loader" style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>Loading markets...</div>;

  return (
    <div className="panel-container">
      <h2 className="panel-title" style={{ color: 'white', marginBottom: '20px' }}>
        {view === "PERSONAL" ? "My Bets" : "Markets"} 
        <span style={{ fontSize: '0.6em', marginLeft: '10px', opacity: 0.6 }}>
          {status ? `(${status.toUpperCase()})` : ""}
        </span>
      </h2>
      
      {markets.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#1e1e1e', borderRadius: '12px' }}>
          No bets found here.
        </div>
      ) : (
        <div className="panel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
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