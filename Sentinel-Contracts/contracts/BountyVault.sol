// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBountyVault.sol";

contract BountyVault is IBountyVault, ReentrancyGuard, Ownable {
    struct Bounty {
        address creator;
        uint256 reward;
        bool isOpen;
    }

    uint256 public platformFeeBps = 500; // 5%
    address public treasury;

    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;

    event RewardLocked(uint256 indexed bountyId, address creator, uint256 reward);
    event RewardReleased(uint256 indexed bountyId, address reporter, uint256 payout, uint256 fee, uint256 gasComp);
    event TreasuryUpdated(address newTreasury);

    constructor(address _treasury)
        Ownable(msg.sender)
    {
        treasury = _treasury;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function lockReward(uint256 bountyId) external payable override {
        require(msg.value > 0, "No reward");
        require(bounties[bountyId].reward == 0, "Bounty exists");

        bounties[bountyId] = Bounty({
            creator: msg.sender,
            reward: msg.value,
            isOpen: true
        });

        bountyCount++;
        emit RewardLocked(bountyId, msg.sender, msg.value);
    }

    function releaseReward(
        uint256 bountyId,
        address reporter,
        uint256 gasCompensation
    ) external override nonReentrant onlyOwner {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.isOpen, "Closed");

        bounty.isOpen = false;

        uint256 platformFee = (bounty.reward * platformFeeBps) / 10_000;
        
        // Ensure gas compensation doesn't exceed available funds after fee
        uint256 totalDeductions = platformFee + gasCompensation;
        require(bounty.reward >= totalDeductions, "Deductions exceed reward");

        uint256 payout = bounty.reward - totalDeductions;

        (bool ok1,) = payable(reporter).call{value: payout}("");
        (bool ok2,) = payable(treasury).call{value: platformFee}("");
        // Gas compensation could be sent to msg.sender (the finalizer/worker)
        (bool ok3,) = payable(msg.sender).call{value: gasCompensation}("");

        require(ok1 && ok2 && ok3, "Transfer failed");
        
        emit RewardReleased(bountyId, reporter, payout, platformFee, gasCompensation);
    }

    function getReward(uint256 bountyId)
        external
        view
        override
        returns (uint256)
    {
        return bounties[bountyId].reward;
    }
}
