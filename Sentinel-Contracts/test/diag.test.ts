import { ethers } from "hardhat";

describe("Diagnostics", function () {
    it("Should inspect ethers", async function () {
        console.log("Ethers keys:", Object.keys(ethers || {}));
        if (ethers && ethers.getSigners) {
            console.log("getSigners exists");
        } else {
            console.log("getSigners DOES NOT exist");
        }
    });
});
