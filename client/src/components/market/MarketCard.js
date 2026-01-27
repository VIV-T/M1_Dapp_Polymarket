import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { initWeb3 } from "../../utils/web3";

export default function MarketCard({ market, refresh, account }) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const fromWeiSafe = (val) => {
    try { return Web3.utils.fromWei(val.toString(), "ether"); } catch { return "0"; }
  };

  const poolA = parseFloat(fromWeiSafe(market.poolA));
  const poolB = parseFloat(fromWeiSafe(market.poolB));
  const total = poolA + poolB;
  const percentA = total > 0 ? (poolA / total) * 100 : 50;

  const timeLeft = Number(market.endTime) - now;
  const isExpired = timeLeft <= 0;
  const isResolved = parseInt(market.stage) === 2;
  const winningOutcome = parseInt(market.winningOutcome);
  const userChoice = parseInt(market.userStakeChoice);
  const hasStaked = market.userStake && market.userStake !== "0";
  const isWinner = isResolved && hasStaked && userChoice === winningOutcome;

  const colorA = "#3b82f6"; 
  const colorB = "#ec4899"; 

  const handleBetAction = async (choice) => {
    if (!account) return alert("Please connect MetaMask.");
    try {
      const { predictionMarket, web3 } = await initWeb3();
      const amount = prompt("Amount to bet (ETH):");
      if (!amount) return;
      await predictionMarket.methods.placeBet(market.id, choice).send({
        from: account,
        value: web3.utils.toWei(amount, "ether")
      });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleResolve = async (outcome) => {
    try {
      const { predictionMarket } = await initWeb3();
      await predictionMarket.methods.resolveMarket(market.id, outcome).send({ from: account });
      refresh();
    } catch (e) { console.error(e); }
  };

  const handleClaim = async () => {
    try {
      const { predictionMarket } = await initWeb3();
      await predictionMarket.methods.claimGain(market.id).send({ from: account });
      refresh();
    } catch (e) { alert("Error while claiming"); }
  };

  return (
    <div className={`market-card ${isExpired && !isResolved ? "border-pending" : ""}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' }}>
        <span style={{ color: isResolved ? '#4ade80' : isExpired ? '#f59e0b' : '#60a5fa' }}>
          {isResolved ? "● Finished" : isExpired ? "● Pending Oracle" : "● Live"}
        </span>
        {!isResolved && !isExpired && (
          <span className="timer-text" style={{ color: timeLeft < 300 ? '#ef4444' : '#ccc' }}>
            {formatTime(timeLeft)}
          </span>
        )}
      </div>

      <h3 className="market-card-title">{market.title}</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
        <span style={{ color: colorA }}>{market.optionA}: {percentA.toFixed(1)}%</span>
        <span style={{ color: colorB }}>{market.optionB}: {(100 - percentA).toFixed(1)}%</span>
      </div>

      <div className="progress-container">
        <div className="progress-fill" style={{ width: `${percentA}%`, backgroundColor: colorA }} />
        <div className="progress-fill" style={{ width: `${100 - percentA}%`, backgroundColor: colorB }} />
      </div>

      <div style={{ marginTop: '24px' }}>
        {!isExpired && !isResolved && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-bet" style={{ backgroundColor: colorA }} onClick={() => handleBetAction(0)} disabled={hasStaked && userChoice !== 0}>
              Bet {market.optionA}
            </button>
            <button className="btn-bet" style={{ backgroundColor: colorB }} onClick={() => handleBetAction(1)} disabled={hasStaked && userChoice !== 1}>
              Bet {market.optionB}
            </button>
          </div>
        )}

        {isExpired && !isResolved && (
          <div className="oracle-box">
            <p style={{ textAlign: 'center', fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>⚖️ ORACLE RESOLUTION</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-resolve" style={{ backgroundColor: '#2563eb', flex: 1 }} onClick={() => handleResolve(0)}>{market.optionA}</button>
              <button className="btn-resolve" style={{ backgroundColor: '#db2777', flex: 1 }} onClick={() => handleResolve(1)}>{market.optionB}</button>
            </div>
          </div>
        )}

        {isResolved && (
          <div className="resolved-banner" style={{ borderColor: winningOutcome === 0 ? colorA : colorB }}>
            <div style={{ color: '#ccc', fontSize: '12px' }}>WINNER</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>
              {winningOutcome === 0 ? market.optionA : market.optionB}
            </div>
            {isWinner && (
              <button className="btn-primary" style={{ marginTop: '10px', width: '100%', backgroundColor: '#fbbf24', color: 'black' }} onClick={handleClaim}>
                CLAIM MY REWARDS
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}