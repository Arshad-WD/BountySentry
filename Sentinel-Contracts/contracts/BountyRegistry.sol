// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract BountyRegistry {
    struct BountyMeta {
        string ipfsHash;
        address creator;
        bool exists;
    }

    mapping(uint256 => BountyMeta) public bounties;

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string ipfsHash
    );

    function registerBounty(
        uint256 bountyId,
        string calldata ipfsHash
    ) external {
        require(!bounties[bountyId].exists, "Already exists");

        bounties[bountyId] = BountyMeta({
            ipfsHash: ipfsHash,
            creator: msg.sender,
            exists: true
        });

        emit BountyCreated(bountyId, msg.sender, ipfsHash);
    }
}
