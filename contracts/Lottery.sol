// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Lottery {
    address payable[] public players;
    address public manager;

    constructor() {
        manager = msg.sender;
    }

    receive() external payable{
        require(msg.value == 0.1 ether);
        players.push(payable(msg.sender));
    }

    function getBalance() public view returns(uint) {
        require(msg.sender == manager);
        return address(this).balance;
    }

    function random() public view returns(uint){
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players.length)));
    }

    function pickWinner() public{
        require(msg.sender == manager);
        require(players.length >= 3);

        uint r = random();
        address payable winner;

        uint index = r % players.length;
        winner = players[index];

        winner.transfer(getBalance());
        players = new address payable[](0);
    }
} 