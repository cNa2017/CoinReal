设计一个合约文件包含一下内容
参考

interface IProject {
    function updateCommentFlag(uint commentId, uint flag) external;
}

contract testProject {
    mapping(uint => uint) commentIdToFlag;
    function getData(uint _commentid) returns(uint) {
        return commentIdToFlag[commentId];
    }
    function updateCommentFlag(uint commentId, uint flag) public {
        commentIdToFlag[commentId] = flag;
    }
}

interface AntoTagInterface {
    function getCommentFlag(string comment) external;
}

contract AutoTag {
    uint prevTagNonce;
    uint tagNonce;

    string tag;

    IProject p;

    constructor(address projectAddr) {
        p = IProject(projectAddr);
    }

    function getCommentFlag(string comment) {
        // 这里调用chainlink的Function分析
        string storage tag = xxx(comment);
        tagNonce ++;
    }

    function tagToFlag(string) returns(flag) {
        if (string == "POS") {
            return 1;
        } 
        if (string == "NEG") {
            return 2;
        }
        if (string == "NEU") {
            return 3;
        }
        return 0;
    }

    function checkUpkeep() {
        // 如果发现tagNonce > prevTagNonce，说明被调用过了请求标签
        bool hasNewReq = tagNonce > prevTagNonce;
        // 这个请求在chainlink的functions那边是否已经返回？
        bool hasFullfil = xxxxx
        // 如果有新的请求，而且已经完成了返回，就触发automation
        upkeepNeed = hasNewReq && hasFullfil;
    }

    function performUpkeep() {
        // 调用我们的project的方法传结果回去
        p.updateCommentFlag
    }
}
