// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {AutomationCompatibleInterface} from "@chainlink/contracts@1.4.0/src/v0.8/automation/AutomationCompatible.sol";


// 这个函数部署完了之后，要拿地址去https://automation.chain.link/fuji注册一下
contract Counter is AutomationCompatibleInterface {

    uint256 public counter;
    uint256 public immutable interval;
    uint256 public lastTimeStamp;

    constructor(uint256 updateInterval) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
        counter = 0;
    }

    // 这里表示，每个区块auto执行一下这个checkUpkeep函数，
    // 如果upkeepNeeded=true，那么performUpkeep就会执行
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
            counter = counter + 1;
        }
    }
}
