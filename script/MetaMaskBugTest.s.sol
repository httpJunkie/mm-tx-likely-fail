// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MetaMaskBugTest} from "../src/MetaMaskBugTest.sol";

contract MetaMaskBugTestScript is Script {
    MetaMaskBugTest public bugTest;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        bugTest = new MetaMaskBugTest();
        
        console.log("MetaMaskBugTest deployed at:", address(bugTest));

        vm.stopBroadcast();
    }
}