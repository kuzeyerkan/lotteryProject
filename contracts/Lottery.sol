pragma solidity ^0.4.17;

contract Lottery {
    address public manager; // uniq adress yarattik
    address[] public players; // dynamic array yarattik
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
             //for validation
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        //sha3
        return uint(keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        players = new address[](0);
    }
    
    modifier restricted() {    //istedigimizi yazabiliriz restricted onemli degil -->e.g onlyManagerCanexecuted 
        require(msg.sender == manager);  
        _;
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }
}   