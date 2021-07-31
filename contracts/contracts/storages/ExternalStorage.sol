// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import '../lib/Strings.sol';
import '../base/Storage.sol';

contract ExternalStorage is Storage {
    using Strings for string;

    bytes32 internal managerName = 'manager';

    constructor(address _manager) {
        setManager(_manager);
    }

    function setManager(address _manager) public override onlyOwner {
        super.setManager(_manager);
        contractName = 'Storage';
        managerName = IOwnable(manager).contractName().toBytes32();
        if (managerName == '') managerName = 'manager';
    }
}
