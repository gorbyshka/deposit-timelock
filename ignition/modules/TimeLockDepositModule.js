const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TimeLockDepositModule", (m) => {

    const gasLimit = 1500000;

    const timeLockDepositContract = m.contract("TimeLockDeposit", [], {
        gasLimit: gasLimit
    });

    return { timeLockDepositContract };

});
