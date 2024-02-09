pragma solidity ^0.8.4;

contract MultiSend {
    function multiSendETH(address[] memory recipients, uint256[] memory amounts) public payable {
        require(recipients.length == amounts.length, "recipients and amounts arrays must have the same length");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(address(this).balance >= amounts[i], "Insufficient balance to send");
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "Transfer failed");
        }
    }
}
