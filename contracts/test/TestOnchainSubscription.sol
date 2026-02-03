// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OnchainSubscription.sol";

contract TestOnchainSubscription is OnchainSubscription {
    address private _permit2;

    constructor(address mockPermit2) {
        _permit2 = mockPermit2;
    }

    function _getPermit2() internal view override returns (address) {
        return _permit2;
    }
}
