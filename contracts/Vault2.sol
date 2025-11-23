// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Vault {

    mapping(address => uint256) private balances;
    mapping(address => uint256) private unlockTime;

    event Deposited(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 amount);

    function depositEther(uint256 _unlockTime) external payable {
        require(msg.value > 0, "Invalid amount");

        if (unlockTime[msg.sender] == 0) {
            require(_unlockTime > block.timestamp, "Unlock time must be in the future");
            unlockTime[msg.sender] = _unlockTime;
        }

        balances[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value, unlockTime[msg.sender]);
    }

    function withdrawEther(uint256 _amount) external {
        require(block.timestamp >= unlockTime[msg.sender], "Vault is still locked");
        require(balances[msg.sender] >= _amount, "Not enough balance");

        balances[msg.sender] -= _amount;
        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Failed to send ether");

        emit Withdrawn(msg.sender, _amount);
    }

    function checkBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function checkUnlockTime() external view returns (uint256) {
        return unlockTime[msg.sender];
    }

    function getCurrentTimestamp() external view returns (uint256) {
    return block.timestamp;
}
}
