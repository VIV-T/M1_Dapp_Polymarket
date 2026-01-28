const PredictionMarket = artifacts.require("PredictionMarket");

module.exports = async function (deployer, network, accounts) {
  try {
    // The address that will be allowed to sign results (your Oracle)
    // We take the first Truffle-provided account for local tests
    const oracleAddress = accounts[0]; 

    console.log("Deploying with Oracle address:", oracleAddress);

    // Deploy and pass ONLY the oracle address
    await deployer.deploy(
      PredictionMarket,
      oracleAddress
    );

    const predictionMarket = await PredictionMarket.deployed();
    console.log("PredictionMarket deployed at:", predictionMarket.address);
    
  } catch (error) {
    console.error("Error deploying PredictionMarket:", error);
  }
};