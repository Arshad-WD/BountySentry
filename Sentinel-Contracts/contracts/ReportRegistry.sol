// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./interfaces/IBountyVault.sol";
import "./interfaces/IReputation.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReportRegistry is Ownable {
    enum Status { PENDING, ACCEPTED, REJECTED }

    struct Report {
        uint256 bountyId;
        address reporter;
        string ipfsHash;
        Status status;
        uint8 approvals;
        uint8 rejections;
        address[] validators;
    }

    uint256 public constant VALIDATOR_STAKE = 0.01 ether;

    uint256 public reportCount;
    mapping(uint256 => Report) public reports;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public validatorVotes; // true if approved, false if rejected
    mapping(uint256 => mapping(address => uint256)) public stakes;

    IBountyVault public bountyVault;
    IReputation public reputation;

    event ReportSubmitted(uint256 indexed reportId, uint256 indexed bountyId, address reporter, string ipfsHash);
    event ReportValidated(uint256 indexed reportId, address indexed validator, bool approved);
    event ReportResolved(uint256 indexed reportId, Status status);
    event StakeSettled(uint256 indexed reportId, address indexed validator, uint256 amount, bool refunded);

    constructor(address _vault, address _reputation) Ownable(msg.sender) {
        bountyVault = IBountyVault(_vault);
        reputation = IReputation(_reputation);
    }

    /* ---------------- REPORT ---------------- */

    function submitReport(
        uint256 bountyId,
        string calldata ipfsHash
    ) external {
        require(bountyVault.getReward(bountyId) > 0, "Invalid bounty");
        
        uint256 reportId = reportCount++;
        Report storage r = reports[reportId];
        r.bountyId = bountyId;
        r.reporter = msg.sender;
        r.ipfsHash = ipfsHash;
        r.status = Status.PENDING;

        emit ReportSubmitted(reportId, bountyId, msg.sender, ipfsHash);
    }

    /* ---------------- VALIDATION ---------------- */

    function validateReport(
        uint256 reportId,
        bool approve
    ) external payable {
        Report storage r = reports[reportId];

        require(r.status == Status.PENDING, "Resolved");
        require(reputation.canValidate(msg.sender), "Not validator");
        require(!hasVoted[reportId][msg.sender], "Already voted");
        require(r.validators.length < 3, "Limit");
        require(msg.sender != r.reporter, "Reporter");
        require(msg.value == VALIDATOR_STAKE, "Stake");

        hasVoted[reportId][msg.sender] = true;
        validatorVotes[reportId][msg.sender] = approve;
        r.validators.push(msg.sender);
        stakes[reportId][msg.sender] = msg.value;

        if (approve) r.approvals++;
        else r.rejections++;

        emit ReportValidated(reportId, msg.sender, approve);

        if (r.approvals >= 2) {
            r.status = Status.ACCEPTED;
        } else if (r.rejections >= 2) {
            r.status = Status.REJECTED;
        }
    }

    /* ---------------- FINALIZATION ---------------- */

    function finalizeReport(
        uint256 reportId,
        uint256 gasCompensation
    ) external onlyOwner {
        Report storage r = reports[reportId];
        require(r.status != Status.PENDING, "Not resolved");

        if (r.status == Status.ACCEPTED) {
            bountyVault.releaseReward(
                r.bountyId,
                r.reporter,
                gasCompensation
            );
            _settleStakes(reportId, true);
        } else {
            _settleStakes(reportId, false);
        }

        emit ReportResolved(reportId, r.status);
    }

    /* ---------------- INTERNAL ---------------- */

    function _settleStakes(uint256 reportId, bool accepted) internal {
        Report storage r = reports[reportId];

        for (uint256 i = 0; i < r.validators.length; i++) {
            address v = r.validators[i];
            uint256 stake = stakes[reportId][v];

            if (stake > 0) {
                bool votedCorrectly = (accepted && validatorVotes[reportId][v]) || (!accepted && !validatorVotes[reportId][v]);
                
                if (votedCorrectly) {
                    reputation.increase(v);
                    (bool sent, ) = payable(v).call{value: stake}("");
                    require(sent, "Stake transfer failed");
                    emit StakeSettled(reportId, v, stake, true);
                } else {
                    reputation.decrease(v);
                    // Stake remains in contract (slashed) - can be pulled to treasury later or used for fees
                    emit StakeSettled(reportId, v, stake, false);
                }
                stakes[reportId][v] = 0;
            }
        }
    }

    // Function to withdraw slashed stakes by owner
    function withdrawSlashedStakes(address _to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = payable(_to).call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    receive() external payable {}
}
