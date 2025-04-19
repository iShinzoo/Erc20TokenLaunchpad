const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenLaunchpadModule", (m) => {
  // Deploy TokenLaunchpad contract
  const tokenLaunchpad = m.contract("TokenLaunchpad");

  return { tokenLaunchpad };
});