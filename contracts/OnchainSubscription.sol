// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title OnchainSubscription
/// @notice Phase 1: Contract skeleton for on-chain subscription management
contract OnchainSubscription {
    /// @notice Subscription data structure
    struct Subscription {
        address subscriber;
        address service;
        uint256 amount;
        uint256 period;
        uint256 lastPaid;
        uint256 nonce;
        bool active;
    }

    /// @notice Maps subscription ID to Subscription data
    mapping(uint256 => Subscription) public subscriptions;

    /// @notice Counter for next subscription ID
    uint256 public nextSubscriptionId;

    /// @notice Creates a new subscription
    /// @dev Placeholder - no logic implemented
    function createSubscription() external {
        revert("Not implemented");
    }

    /// @notice Cancels an active subscription
    /// @param subscriptionId The ID of the subscription to cancel
    /// @dev Placeholder - no logic implemented
    function cancelSubscription(uint256 subscriptionId) external {
        revert("Not implemented");
    }

    /// @notice Claims a payment for a subscription
    /// @param subscriptionId The ID of the subscription
    /// @param signature The signature authorizing the payment
    /// @dev Placeholder - no logic implemented
    function claimPayment(uint256 subscriptionId, bytes calldata signature) external {
        revert("Not implemented");
    }
}
