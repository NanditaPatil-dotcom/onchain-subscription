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
        uint256 balance;
        bool active;
    }

    /// @notice Maps subscription ID to Subscription data
    mapping(uint256 => Subscription) public subscriptions;

    /// @notice Counter for next subscription ID
    uint256 public nextSubscriptionId;

    /// @notice Creates a new subscription
    /// @dev Placeholder - no logic implemented
    function createSubscription(
        address service,
        uint256 amount,
        uint256 period
    ) external payable{
        require(msg.value > 0, "No ETH sent");

        uint256 subscriptionId = nextSubscriptionId;

        subscriptions[subscriptionId] = Subscription({
        subscriber: msg.sender,
        service: service,
        amount: amount,
        period: period,
        lastPaid: block.timestamp,
        nonce: 0,
        balance: msg.value,
        active: true
    });
       nextSubscriptionId++;
    }


    /// @notice Cancels an active subscription
    /// @param subscriptionId The ID of the subscription to cancel
    /// @dev Placeholder - no logic implemented
    function cancelSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];

        require(sub.subscriber == msg.sender, "Not subscriber");
        require(sub.active, "Already inactive");

        sub.active = false;

        uint256 refund = sub.balance;
        sub.balance = 0;

        (bool ok, ) = msg.sender.call{value: refund}("");
        require(ok, "Refund failed");
    }

    /// @notice Claims a payment for a subscription
    /// @param subscriptionId The ID of the subscription
    /// @param signature The signature authorizing the payment
    /// @dev Placeholder - no logic implemented
    function claimPayment(uint256 subscriptionId, bytes calldata signature) external {
        Subscription storage sub = subscriptions[subscriptionId];

        require(sub.active, "Inactive subscription");
        require(
        block.timestamp >= sub.lastPaid + sub.period,
        "Payment not due yet"
       );

       revert("Payment logic not implemented");
    }
}
