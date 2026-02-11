// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IReputation.sol";

contract ValidatorReputation is IReputation, Ownable {
    mapping(address => uint256) public reputation;
    address public registry;

    event ReputationUpdated(address indexed validator, uint256 newReputation);

    constructor() Ownable(msg.sender) {
        // Initial reputation for deployer to allow initial validations if needed
        reputation[msg.sender] = 1;
    }

    modifier onlyRegistry() {
        require(msg.sender == registry, "Not registry");
        _;
    }

    function setRegistry(address _registry) external onlyOwner {
        registry = _registry;
    }

    function grantReputation(address validator) external onlyOwner {
        reputation[validator]++;
        emit ReputationUpdated(validator, reputation[validator]);
    }

    function canValidate(address validator)
        external
        view
        override
        returns (bool)
    {
        return reputation[validator] > 0;
    }

    function increase(address validator) external override onlyRegistry {
        reputation[validator]++;
        emit ReputationUpdated(validator, reputation[validator]);
    }

    function decrease(address validator) external override onlyRegistry {
        if (reputation[validator] > 0) {
            reputation[validator]--;
        }
        emit ReputationUpdated(validator, reputation[validator]);
    }
}
