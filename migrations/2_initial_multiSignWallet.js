const MultiSignWallet = artifacts.require("MultiSignWallet");

module.exports = function (deployer) {
  deployer.deploy(MultiSignWallet);
};
