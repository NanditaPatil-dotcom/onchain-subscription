// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";



/// @title OnchainSubscription
/// @notice Phase 1: Contract skeleton for on-chain subscription management
contract OnchainSubscription is EIP712{
    /// @notice Subscription data structure
    using ECDSA for bytes32;
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
    bytes32 public constant PAYMENT_TYPEHASH =
        keccak256(
            "PaymentApproval(uint256 subscriptionId,uint256 amount,uint256 nonce,uint256 expiry)"
        );
         constructor() EIP712("OnchainSubscription", "1") {}
    /// @notice Creates a new subscription
    /// @dev Placeholder - no logic implemented
    function createSubscription(
        address service,
        uint256 amount,
        uint256 period
    ) external payable{
        require(msg.value > 0, "No ETH sent");
        require(service != address(0), "Invalid service");
        uint256 id = nextSubscriptionId++;

        subscriptions[id] = Subscription({
        subscriber: msg.sender,
        service: service,
        amount: amount,
        period: period,
        lastPaid: block.timestamp,
        nonce: 0,
        balance: msg.value,
        active: true
    });
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
    function claimPayment(
        uint256 subscriptionId,
        uint256 amount,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature) external {

        Subscription storage sub = subscriptions[subscriptionId];

        require(sub.active, "Inactive subscription");
        require(msg.sender == sub.service, "Not service");
        require(block.timestamp >= sub.lastPaid + sub.period, "Payment not due yet");
        require(block.timestamp <= expiry, "Signature expired");
        require(nonce == sub.nonce, "Invalid nonce");
        require(amount <= sub.amount, "Amount exceeds limit");
        require(amount <= sub.balance, "Insufficient balance");

        bytes32 digest = _hashPaymentApproval(
            subscriptionId,
            amount,
            nonce,
            expiry
        );

        address signer = digest.recover(signature);
        require(signer == sub.subscriber, "Invalid signature");

        sub.nonce++;
        sub.lastPaid = block.timestamp;
        sub.balance -= amount;

        (bool ok, ) = sub.service.call{value: amount}("");
        require(ok, "Payment failed");
    }

        function _hashPaymentApproval(
        uint256 subscriptionId,
        uint256 amount,
        uint256 nonce,
        uint256 expiry
    ) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    PAYMENT_TYPEHASH,
                    subscriptionId,
                    amount,
                    nonce,
                    expiry
                )
            )
        );
    }
}
