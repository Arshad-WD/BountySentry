// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IReputation {
    function canValidate(address validator) external view returns (bool);
    function increase(address validator) external;
    function decrease(address validator) external;
}
