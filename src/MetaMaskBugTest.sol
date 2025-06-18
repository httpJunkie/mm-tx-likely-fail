// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract MetaMaskBugTest {
    event TransactionSucceeded(string message, address caller);
    event InternalCallFailed(string reason);
    
    uint256 public successCount;
    
    // This function will always revert when called externally
    function alwaysReverts() external pure {
        revert("This function always reverts");
    }
    
    // This function catches the revert and succeeds
    // This should trigger the MetaMask "likely to fail" warning
    function catchRevertAndSucceed() external {
        try this.alwaysReverts() {
            // This block won't execute because alwaysReverts() always reverts
            emit TransactionSucceeded("Unexpected success", msg.sender);
        } catch Error(string memory reason) {
            // This block will execute, catching the revert
            emit InternalCallFailed(reason);
            emit TransactionSucceeded("Caught revert successfully", msg.sender);
            successCount++;
        } catch {
            // Fallback catch block for any other errors
            emit InternalCallFailed("Unknown error");
            emit TransactionSucceeded("Caught unknown error", msg.sender);
            successCount++;
        }
    }
    
    // Helper function to verify the contract state
    function getSuccessCount() external view returns (uint256) {
        return successCount;
    }
    
    // Simple function that should work without warnings (for comparison)
    function simpleSuccess() external {
        emit TransactionSucceeded("Simple success", msg.sender);
        successCount++;
    }
}