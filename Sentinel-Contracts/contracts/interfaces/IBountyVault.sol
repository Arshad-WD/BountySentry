// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IBountyVault {
    function lockReward(uint256 bountyId) external payable;

    function releaseReward(
        uint256 bountyId,
        address reporter,
        uint256 gasCompensation
    ) external;

    function getReward(uint256 bountyId)
        external
        view
        returns (uint256);
}
