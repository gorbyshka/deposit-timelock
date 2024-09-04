// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract DepositContract {
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastWithdrawalTime;

    uint256 public constant TIMELOCK_DURATION = 1 minutes;  

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balances[msg.sender] += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        uint256 userBalance = balances[msg.sender];
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(userBalance >= amount, "Insufficient balance");

        
        require(
            block.timestamp >= lastWithdrawalTime[msg.sender] + TIMELOCK_DURATION,
            "Cannot withdraw yet, please wait for the timelock duration."
        );

        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        
        lastWithdrawalTime[msg.sender] = block.timestamp;

        emit Withdrawal(msg.sender, amount);
    }

    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function getLastWithdrawalTime(address user) external view returns (uint256) {
        return lastWithdrawalTime[user];
    }
}
