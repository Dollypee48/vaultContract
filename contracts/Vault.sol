// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

contract vault {

    mapping(address owner => uint256 amount) private balances;


    function saveEther() external payable {
    require(msg.sender != address(0), "Invalid address");
    require(msg.value > 0, "Invalid amount");
       
    balances[msg.sender] += msg.value;

    }

    function withdrawEther (uint256 _amount) public payable {
        require(msg.sender != address(0), "Invalid address");
        require(_amount > 0, "Invalid Amount");
        require(balances[msg.sender] >= _amount, "Not enough");

    balances[msg.sender] = balances[msg.sender] - _amount;

    (bool sent, ) = payable(msg.sender).call{value: _amount}("");

    require(sent, "Failed to sent ether");

    }

    function checkBalance() external view returns (uint256 _userBalance, uint256 _contractBalance){

        _contractBalance = address(this).balance;
        _userBalance = balances[msg.sender];
    }
    
}