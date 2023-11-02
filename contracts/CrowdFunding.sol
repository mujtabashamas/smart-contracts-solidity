// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CrowdFunding {
    mapping(address => uint) public contributers;
    address public admin;
    uint public noOfContributers;
    uint public minimumContribution;
    uint public deadline;
    uint public goal;
    uint public raisedAmount;

    struct Request {
        string description;
        address payable recipient;
        uint value;
        bool completed;
        uint noOfVoters;
        mapping(address => bool) voters;
    }

    mapping(uint => Request) public requests;
    uint public numRequests;

    event ContributeEvent(address _sender, uint _value);
    event CreateRequestEvent(
        string _description,
        address _recipient,
        uint _value
    );
    event MakePaymentEvent(address _recipient, uint _value);

    constructor(uint _goal, uint _deadline) {
        goal = _goal;
        deadline = block.timestamp + _deadline;
        admin = msg.sender;
        minimumContribution = 100 wei;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can execute this");
        _;
    }

    function contribute() public payable {
        require(block.timestamp < deadline, "the deadline has passed!");
        require(
            msg.value >= minimumContribution,
            "minimum contribution not met!"
        );

        if (contributers[msg.sender] == 0) {
            noOfContributers++;
        }

        contributers[msg.sender] += msg.value;
        raisedAmount += msg.value;

        emit ContributeEvent(msg.sender, msg.value);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getRefund() public {
        require(block.timestamp > deadline && raisedAmount < goal);
        require(contributers[msg.sender] > 0);

        address payable recipient = payable(msg.sender);
        uint value = contributers[msg.sender];

        contributers[msg.sender] = 0;
        recipient.transfer(value);
    }

    function createRequest(
        string calldata _description,
        address payable _recipient,
        uint _value
    ) public onlyAdmin {
        Request storage newRequest = requests[numRequests];
        numRequests++;

        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.noOfVoters = 0;

        emit CreateRequestEvent(_description, _recipient, _value);
    }

    function voteRequest(uint _requestNo) public {
        require(
            contributers[msg.sender] > 0,
            "You must be a contributer to vote!"
        );

        Request storage thisRequest = requests[_requestNo];
        require(
            thisRequest.voters[msg.sender] == false,
            "You have already voted!"
        );

        thisRequest.voters[msg.sender] = true;
        thisRequest.noOfVoters++;
    }

    function makePaymenmt(uint _requestNo) public onlyAdmin {
        Request storage thisRequest = requests[_requestNo];
        require(
            thisRequest.completed == false,
            "The request has been completed!"
        );

        require(
            thisRequest.noOfVoters > noOfContributers / 2,
            "Less than 50% of contributers have voted!"
        );

        thisRequest.completed = true;
        thisRequest.recipient.transfer(thisRequest.value);

        emit MakePaymentEvent(thisRequest.recipient, thisRequest.value);
    }
}
