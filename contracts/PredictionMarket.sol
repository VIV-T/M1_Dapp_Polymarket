// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    enum Stage { Active, Pending, Resolved }

    struct Market {
        uint256 id;
        string title;
        string optionA;
        string optionB;
        uint256 endTime;
        uint256 poolA;
        uint256 poolB;
        Stage stage;
        uint8 winningOutcome;
        address creator;
    }

    struct Bet {
        uint256 amount;
        uint8 choice; // 0 or 1
        bool exists;
    }

    Market[] public markets;
    mapping(uint256 => mapping(address => Bet)) public userBets;
    uint256 public nextMarketId;

    function createMarket(
        string memory _title, 
        string memory _opA, 
        string memory _opB, 
        uint256 _durationSeconds
    ) external {
        require(_durationSeconds > 0, "Invalid duration");
        
        markets.push(Market({
            id: nextMarketId,
            title: _title,
            optionA: _opA,
            optionB: _opB,
            endTime: block.timestamp + _durationSeconds,
            poolA: 0,
            poolB: 0,
            stage: Stage.Active,
            winningOutcome: 0,
            creator: msg.sender
        }));
        nextMarketId++;
    }

    function placeBet(uint256 _marketId, uint8 _choice) external payable {
        Market storage m = markets[_marketId];
        require(block.timestamp < m.endTime, "Betting period ended");
        require(msg.value > 0, "Insufficient amount");
        require(_choice == 0 || _choice == 1, "Invalid choice");

        Bet storage userBet = userBets[_marketId][msg.sender];

        // RESTRICTION LOGIC
        if (userBet.amount > 0) {
            // If the user already bet, they MUST choose the same option
            require(userBet.choice == _choice, "You already bet on the other option");
        } else {
            // First bet: store their choice
            userBet.choice = _choice;
        }

        userBet.amount += msg.value;
        
        if (_choice == 0) m.poolA += msg.value;
        else m.poolB += msg.value;
    }

    function resolveMarket(uint256 _marketId, uint8 _outcome) external {
        Market storage m = markets[_marketId];
        require(block.timestamp >= m.endTime, "Event not finished");
        m.winningOutcome = _outcome;
        m.stage = Stage.Resolved;
    }

    function getMarkets() external view returns (Market[] memory) {
        return markets;
    }

    // --- NEW WITHDRAW FUNCTION ---
    function claimGain(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        
        require(m.stage == Stage.Resolved, "Market not resolved");
        
        Bet storage userBet = userBets[_marketId][msg.sender];
        require(userBet.amount > 0, "No bet found");
        require(userBet.choice == m.winningOutcome, "You did not win");

        uint256 winningPool = (m.winningOutcome == 0) ? m.poolA : m.poolB;
        require(winningPool > 0, "No bets on the winner");
        uint256 losingPool = (m.winningOutcome == 0) ? m.poolB : m.poolA;

        // Polymarket formula: Stake + proportional share of the losing pool
        // Reward = UserStake + (UserStake / TotalWinningStakes) * TotalLosingStakes
        uint256 reward = userBet.amount + (userBet.amount * losingPool / winningPool);

        userBet.amount = 0; // Reentrancy safety: clear before sending
        
        payable(msg.sender).transfer(reward);
    }
}