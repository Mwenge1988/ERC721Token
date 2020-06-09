const Sadccoin = artifacts.require("Sadccoin");
module.exports = (deployer) => {
  deployer.deploy(Sadccoin);
};