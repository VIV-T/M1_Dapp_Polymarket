import Web3 from "web3";
import PredictionMarketABI from "../contracts/PredictionMarket.json"; 

// Shared instances (Singletons)
let web3Instance = null;
let contractInstance = null;

const initWeb3 = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // If already initialized, return the existing instances
  if (web3Instance && contractInstance) {
    return { web3: web3Instance, predictionMarket: contractInstance };
  }

  // Otherwise initialize once
  web3Instance = new Web3(window.ethereum);
  
  try {
    // Request account access if needed
    await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // Contract address (make sure to update after each migrate --reset)
    const deployedAddress = "0x1D880d578D0C84b0CA75e7c80220c9152aa33333"; 
    
    contractInstance = new web3Instance.eth.Contract(
      PredictionMarketABI.abi,
      deployedAddress
    );

    return { web3: web3Instance, predictionMarket: contractInstance };
  } catch (error) {
    // Reset instances on error to allow retry
    web3Instance = null;
    contractInstance = null;
    throw new Error("Access to MetaMask denied or initialization error");
  }
};

export { initWeb3 };