// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {MetaMaskBugTest} from "../src/MetaMaskBugTest.sol";

contract MetaMaskBugTestTest is Test {
    MetaMaskBugTest public bugTest;

    function setUp() public {
        bugTest = new MetaMaskBugTest();
    }

    function test_AlwaysReverts() public {
        // This should revert
        vm.expectRevert("This function always reverts");
        bugTest.alwaysReverts();
    }

    function test_CatchRevertAndSucceed() public {
        // This should succeed despite the internal revert
        uint256 initialCount = bugTest.getSuccessCount();
        
        bugTest.catchRevertAndSucceed();
        
        uint256 finalCount = bugTest.getSuccessCount();
        assertEq(finalCount, initialCount + 1);
    }

    function test_SimpleSuccess() public {
        // This should succeed without any internal reverts
        uint256 initialCount = bugTest.getSuccessCount();
        
        bugTest.simpleSuccess();
        
        uint256 finalCount = bugTest.getSuccessCount();
        assertEq(finalCount, initialCount + 1);
    }
}