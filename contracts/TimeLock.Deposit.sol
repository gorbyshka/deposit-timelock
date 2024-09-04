// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract TimeLockDeposit {
    uint constant MINIMUM_DELAY = 10;  // Минимальная задержка в секундах
    uint constant MAXIMUM_DELAY = 1 days;  // Максимальная задержка в секундах
    uint constant GRACE_PERIOD = 1 days;  // Период выполнения транзакции после задержки

    address public owner;
    mapping(address => uint256) public balances;
    mapping(bytes32 => uint) public depositQueue;  // Очередь для депозита
    mapping(bytes32 => uint) public withdrawQueue;  // Очередь для вывода

    event QueuedDeposit(bytes32 indexed txId, address indexed user, uint256 amount, uint256 timestamp);
    event ExecutedDeposit(bytes32 indexed txId, address indexed user, uint256 amount);
    event QueuedWithdrawal(bytes32 indexed txId, address indexed user, uint256 amount, uint256 timestamp);
    event ExecutedWithdrawal(bytes32 indexed txId, address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function queueDeposit(uint256 _amount, uint _timestamp) external {
        require(
            _timestamp >= block.timestamp + MINIMUM_DELAY &&
            _timestamp <= block.timestamp + MAXIMUM_DELAY,
            "Invalid timestamp"
        );

        bytes32 txId = keccak256(
            abi.encode(msg.sender, _amount, _timestamp, "deposit")
        );

        require(depositQueue[txId] == 0, "Deposit already queued");

        depositQueue[txId] = _timestamp;

        emit QueuedDeposit(txId, msg.sender, _amount, _timestamp);
    }

    function executeDeposit(uint256 _amount, uint _timestamp) external payable {
        bytes32 txId = keccak256(
            abi.encode(msg.sender, _amount, _timestamp, "deposit")
        );

        uint queuedTimestamp = depositQueue[txId];
        require(queuedTimestamp > 0, "Deposit not queued");
        require(block.timestamp >= queuedTimestamp, "Too early to execute");
        require(block.timestamp <= queuedTimestamp + GRACE_PERIOD, "Transaction expired");

        delete depositQueue[txId];

        require(msg.value == _amount, "Incorrect deposit amount");
        balances[msg.sender] += _amount;

        emit ExecutedDeposit(txId, msg.sender, _amount);
    }

    function queueWithdraw(uint256 _amount, uint _timestamp) external {
        require(
            _timestamp >= block.timestamp + MINIMUM_DELAY &&
            _timestamp <= block.timestamp + MAXIMUM_DELAY,
            "Invalid timestamp"
        );

        bytes32 txId = keccak256(
            abi.encode(msg.sender, _amount, _timestamp, "withdraw")
        );

        require(withdrawQueue[txId] == 0, "Withdrawal already queued");

        withdrawQueue[txId] = _timestamp;

        emit QueuedWithdrawal(txId, msg.sender, _amount, _timestamp);
    }

    function executeWithdraw(uint256 _amount, uint _timestamp) external {
        bytes32 txId = keccak256(
            abi.encode(msg.sender, _amount, _timestamp, "withdraw")
        );

        uint queuedTimestamp = withdrawQueue[txId];
        require(queuedTimestamp > 0, "Withdrawal not queued");
        require(block.timestamp >= queuedTimestamp, "Too early to execute");
        require(block.timestamp <= queuedTimestamp + GRACE_PERIOD, "Transaction expired");

        delete withdrawQueue[txId];

        uint256 userBalance = balances[msg.sender];
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(userBalance >= _amount, "Insufficient balance");

        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit ExecutedWithdrawal(txId, msg.sender, _amount);
    }

    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
