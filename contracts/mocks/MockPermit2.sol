// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OnchainSubscription.sol";

contract MockPermit2 {
    event PermitUsed(
        address owner,
        address token,
        address to,
        uint256 amount
    );

    function permitTransferFrom(
        IPermit2.PermitTransferFrom calldata permit,
        IPermit2.SignatureTransferDetails calldata transferDetails,
        address owner,
        bytes calldata /* signature */
    ) external {
        // We DO NOT verify signature here.
        // That is Permit2's responsibility.

        emit PermitUsed(
            owner,
            permit.permitted.token,
            transferDetails.to,
            transferDetails.requestedAmount
        );
    }
}
