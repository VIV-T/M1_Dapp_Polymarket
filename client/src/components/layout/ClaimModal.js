import { useState } from "react"

export default function ClaimModal({ onClose, onClaim }) {
  const [amount, setAmount] = useState(100)
  const [loading, setLoading] = useState(false)

  function handleClaim() {
    setLoading(true)

    // stub - will call the smart contract here later
    setTimeout(() => {
      onClaim(amount)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Claim Tokens</h2>

        <p className="modal-desc">
          Claim test tokens for Polymarket.
        </p>

        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            onClick={handleClaim}
            disabled={loading}
          >
            {loading ? "Claiming..." : "Confirm Claim"}
          </button>
        </div>
      </div>
    </div>
  )
}
