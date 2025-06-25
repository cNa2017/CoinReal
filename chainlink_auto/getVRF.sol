// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity 0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.4.0/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.4.0/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";


contract SubscriptionConsumer is VRFConsumerBaseV2Plus {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // 这个请求生成了吗？
        bool exists; // 这个请求Id存在吗？
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */

    // 你的订阅ID
    uint256 public s_subscriptionId;

    // 过去的请求ID
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // 使用的gas lane，指定最大gas价格
    // 每个网络的可用gas lane列表，
    // 见https://docs.chain.link/vrf/v2-5/supported-networks
    // 这里是sepolia的keyHash：0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
    // 这里是fuji的keyHash：0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887
    bytes32 public keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    uint32 public callbackGasLimit = 100000;

    // 默认是3，但你可以设置更高
    uint16 public requestConfirmations = 1;
ß
    // 在这个例子中，一次请求2个随机值。
    // 不能超过VRFCoordinatorV2_5.MAX_NUM_WORDS。
    uint32 public numWords = 3;


    // 这个COORDINATOR每个网络不一样，
    // 见https://docs.chain.link/vrf/v2-5/supported-networks
    // 这个是sepolia：0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
    // 这个是fuji：0xE40895D055bccd2053dD0638C9695E326152b1A4
    constructor(
        uint256 subscriptionId
    ) VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B) {
        s_subscriptionId = subscriptionId;
    }

    // 假设订阅有足够的资金。
    // @param enableNativePayment: 设置为`true`以启用原生代币支付，或`false`以支付LINK
    function requestRandomWords(
        bool enableNativePayment
    ) external onlyOwner returns (uint256 requestId) {
        // 如果订阅没有设置和有足够的资金，会revert
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }
}
