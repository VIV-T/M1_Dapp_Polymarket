const UMAOptimisticOracleMock = artifacts.require("UMAOptimisticOracleMock");

module.exports = async function (deployer) {
  try {
    await deployer.deploy(UMAOptimisticOracleMock);
    const umaMock = await UMAOptimisticOracleMock.deployed();
    console.log("UMAOptimisticOracleMock deployed at:", umaMock.address);
  } catch (error) {
    console.error("Error deploying UMAOptimisticOracleMock:", error);
  }
};
