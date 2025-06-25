设计一个合约

interface IMyLogic {
    function setLuckerIds(uint[]) external;
}

interface IMyChainlink {
    function getVRF(uint, uint) external;
}

contract MyChainlink {
    uint prevVrfNonce;
    uint vrfNonce;
    uint[] public vrf;

    IMyLogic logic;

    constructor(address _logicAddr) {
        logic = IMyLogic(_logicAddr);
    }

    // 切换逻辑合约
    function setLogic(address _logicAddr) {
        logic = IMyLogic(_logicAddr);
    }

    // 表示从range中抽n个幸运数字，比如10个抽3个随机数得比如[1，3，7]
    function getVRF(uint range, uint n) public {
        // 这里调用chainlink的vrf请求
        vrfNonce ++;
    }

    function checkUpkeep(bytes calldata) {
        // 是不是有了新的随机数请求？
        bool hasNewReq = vrfNonce - prevVrfNonce > 0;
        // 这个随机数请求是否已经计算完成？
        bool hasFullfil = xxxx;
        
        // 如果都ok了，就可以准备发起perform的automation了
        upkeepNeed = hasNewReq && hasFullfil;
    }

    function performUpkeep() {
        // 是不是有了新的随机数请求？
        bool hasNewReq = vrfNonce - prevVrfNonce > 0;
        // 这个随机数请求是否已经计算完成？
        bool hasFullfil = xxxx;

        // 如果都ok了，就可以准备发起perform的automation了
        upkeepNeed = hasNewReq && hasFullfil;

        // 远程调用
        logic.setLuckerIds(uint[]);
        // 表示已经完成改了随机数写入
        prevVrfNonce++
    }
}