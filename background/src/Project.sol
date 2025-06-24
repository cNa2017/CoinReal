// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IProject.sol";
import "./interfaces/ICampaign.sol";
import "./interfaces/ICoinRealPlatform.sol";
import "./interfaces/IPriceOracle.sol";

interface AutoTagInterface {
    // getgetCommentFlag就是我们在project里面调用的函数
    function getCommentFlag(uint commentId, string calldata comment) external returns (bytes32 requestId);
    function tagToFlag(string memory tag) external pure returns (uint);
    // 这个是我们project合约部署时候要更新给AutoTag的
    function updateProjectContract(address _newProjectContract) external;
    function updateSubscriptionId(uint64 _newSubscriptionId) external;
}

contract Project is IProject, Initializable {
    
    // ====== 基本信息字段 ======
    string public name;                    // 项目名称
    string public symbol;                  // 项目符号  
    string public description;             // 项目描述
    string public category;                // 项目分类
    address public creator;                // 项目创建者
    bool public isActive;                  // 项目是否激活
    address public platform;               // 平台合约地址
    address public priceOracle;            // 价格预言机（空实现，准入门槛用）
    
    // ====== 评论系统字段 ======
    uint256 public commentIdCounter;                           // 评论ID计数器
    mapping(uint256 => Comment) public comments;               // 评论映射
    mapping(address => uint256[]) public userComments;         // 用户评论列表
    mapping(address => mapping(uint256 => bool)) public hasLiked; // 点赞记录
    
    // ====== 统计字段 ======
    uint256 public totalComments;          // 总评论数
    uint256 public totalLikes;             // 总点赞数
    uint256 public lastActivityTime;       // 最后活动时间
    address[] public participants;         // 参与者列表
    mapping(address => bool) public isParticipant; // 参与者映射
    
    // ====== Campaign管理字段 ======
    address[] public campaigns;            // 该项目的所有Campaign列表
    mapping(address => bool) public isCampaign; // Campaign验证映射
    
    // ====== 兼容性字段 (保留旧接口) ======
    uint16 public drawPeriod; // 兼容性保留
    uint256 public nextDrawTime; // 兼容性保留

    // ====== AutoTagAI打标签部分 =======
    address public autoTagContract = 0x4cf76ab799BDA2A205Bef7f3F40F2538C9169Fe9; //fuji已经部署
    AutoTagInterface public autoTag = AutoTagInterface(autoTagContract);
    // 只要不是换sepolia或者其他网络，不需要再运行了
    function setAutoTagContract(address _autoTagContract) external {
        autoTagContract = _autoTagContract;
        autoTag = AutoTagInterface(autoTagContract);
    }
    
    // 注意：事件在接口中已定义，这里不再重复定义
    
    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform can call");
        _;
    }
    
    modifier onlyActive() {
        require(isActive, "Project is not active");
        _;
    }
    
    function initialize(
        string calldata _name,
        string calldata _symbol,
        string calldata _description,
        string calldata _category,
        uint16 _drawPeriod, // 保留兼容性，但不使用
        address _creator,
        address _priceOracle,
        address _platform
    ) external initializer {
        require(bytes(_name).length > 0, "Name required");
        require(_creator != address(0), "Invalid creator");
        require(_platform != address(0), "Invalid platform");
        
        name = _name;
        symbol = _symbol;
        description = _description;
        category = _category;
        creator = _creator;
        priceOracle = _priceOracle; // 空实现，准入门槛用
        platform = _platform;
        drawPeriod = _drawPeriod; // 兼容性
        nextDrawTime = block.timestamp + (_drawPeriod * 1 days); // 兼容性
        
        isActive = true;
        lastActivityTime = block.timestamp;
        
        emit ProjectInitialized(_name, _symbol, _creator);
    }
    
    // ====== 评论系统核心功能 ======
    
    /**
     * @dev 发表评论
     */
    function postComment(string calldata content) external onlyActive returns (uint256 commentId) {
        require(bytes(content).length > 0, "Content required");
        require(bytes(content).length <= 1000, "Content too long");
        
        commentId = commentIdCounter++;
        
        Comment storage comment = comments[commentId];
        comment.id = commentId;
        comment.author = msg.sender;
        comment.content = content;
        comment.timestamp = uint32(block.timestamp);
        comment.likes = 0;
        comment.crtReward = 0; // 兼容性，不再使用
        comment.isElite = false; // 精英状态由Campaign决定
        
        userComments[msg.sender].push(commentId);
        
        // 更新参与者
        if (!isParticipant[msg.sender]) {
            isParticipant[msg.sender] = true;
            participants.push(msg.sender);
        }
        
        totalComments++;
        lastActivityTime = block.timestamp;
        
        // 平台统计追踪
        try ICoinRealPlatform(platform).recordUserActivity(msg.sender) {} catch {}
        try ICoinRealPlatform(platform).recordComment() {} catch {}
        
        // 通知所有活跃的Campaign
        _notifyCampaignsCommentPosted(msg.sender, commentId);

        // TAG打标签
        antoTag.getCommentFlag(commentId, content);
        
        emit CommentPosted(commentId, msg.sender, content);
    }

    // TAG上面的tag打标签提交后，一分钟后automantion就回调用这个方法
    function updateCommentFlag(uint256 commentId, uint256 flag) external {
        require(commentId < commentIdCounter, "Invalid comment ID");
        require(flag == 1 || flag == 2 || flag == 3, "Invalid flag");
        comments[commentId].flag = flag;
    }
    
    /**
     * @dev 点赞评论
     */
    function likeComment(uint256 commentId) external onlyActive {
        require(commentId < commentIdCounter, "Invalid comment ID");
        require(!hasLiked[msg.sender][commentId], "Already liked");
        
        Comment storage comment = comments[commentId];
        require(comment.author != address(0), "Comment does not exist");
        
        hasLiked[msg.sender][commentId] = true;
        comment.likes++;
        
        // 更新参与者
        if (!isParticipant[msg.sender]) {
            isParticipant[msg.sender] = true;
            participants.push(msg.sender);
        }
        
        totalLikes++;
        lastActivityTime = block.timestamp;
        
        // 平台统计追踪
        try ICoinRealPlatform(platform).recordUserActivity(msg.sender) {} catch {}
        
        // 通知所有活跃的Campaign
        _notifyCampaignsCommentLiked(msg.sender, comment.author, commentId);
        
        emit CommentLiked(commentId, msg.sender);
    }
    
    // ====== Campaign管理功能 ======
    
    /**
     * @dev 添加Campaign - 只能由平台调用
     */
    function addCampaign(address campaign) external onlyPlatform {
        require(campaign != address(0), "Invalid campaign");
        require(!isCampaign[campaign], "Campaign already added");
        
        campaigns.push(campaign);
        isCampaign[campaign] = true;
        
        emit CampaignAdded(campaign);
    }
    
    /**
     * @dev 获取项目的所有Campaign
     */
    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
    
    /**
     * @dev 获取用户在所有Campaign中的CRT总数
     */
    function getUserTotalCRT(address user) external view returns (uint256 totalCRT) {
        for (uint256 i = 0; i < campaigns.length; i++) {
            try ICampaign(campaigns[i]).balanceOf(user) returns (uint256 balance) {
                totalCRT += balance;
            } catch {
                // 忽略错误，继续下一个Campaign
            }
        }
    }
    
    /**
     * @dev 获取用户在所有Campaign中的详细CRT信息
     */
    function getUserCampaignCRTDetails(address user) external view returns (
        address[] memory campaignAddresses,
        uint256[] memory commentCRTs,
        uint256[] memory likeCRTs,
        uint256[] memory totalCRTs,
        uint256[] memory pendingRewards
    ) {
        uint256 length = campaigns.length;
        campaignAddresses = new address[](length);
        commentCRTs = new uint256[](length);
        likeCRTs = new uint256[](length);
        totalCRTs = new uint256[](length);
        pendingRewards = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            campaignAddresses[i] = campaigns[i];
            try ICampaign(campaigns[i]).getUserCRTBreakdown(user) returns (
                uint256 commentTokens,
                uint256 likeTokens,
                uint256 totalTokens,
                uint256 pendingReward
            ) {
                commentCRTs[i] = commentTokens;
                likeCRTs[i] = likeTokens;
                totalCRTs[i] = totalTokens;
                pendingRewards[i] = pendingReward;
            } catch {
                // 如果调用失败，保持默认值0
            }
        }
    }
    
    // ====== 查询函数 ======
    
    /**
     * @dev 获取评论详情
     */
    function getComment(uint256 commentId) external view returns (Comment memory) {
        return comments[commentId];
    }
    
    /**
     * @dev 分页获取评论列表
     */
    function getComments(uint256 offset, uint256 limit) external view returns (Comment[] memory commentList, uint256 total) {
        total = commentIdCounter;
        
        if (offset >= total) {
            return (new Comment[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        commentList = new Comment[](end - offset);
        for (uint256 i = 0; i < end - offset; i++) {
            commentList[i] = comments[offset + i];
        }
    }
    
    /**
     * @dev 获取项目统计信息
     */
    function getProjectStats() external view returns (
        uint256 totalParticipants,
        uint256 _totalLikes,
        uint256 _lastActivityTime,
        uint256 currentPoolUSD // 从所有Campaign中获取奖池总额
    ) {
        totalParticipants = participants.length;
        _totalLikes = totalLikes;
        _lastActivityTime = lastActivityTime;
        
        // 计算所有Campaign的奖池总额
        currentPoolUSD = 0;
        for (uint256 i = 0; i < campaigns.length; i++) {
            try ICampaign(campaigns[i]).totalRewardPool() returns (uint256 rewardPool) {
                currentPoolUSD += rewardPool;
            } catch {
                // 忽略错误，继续下一个Campaign
            }
        }
    }
    
    /**
     * @dev 获取总参与者数量
     */
    function getTotalParticipants() external view returns (uint256) {
        return participants.length;
    }
    
    /**
     * @dev 检查用户是否点赞了评论
     */
    function hasUserLikedComment(address user, uint256 commentId) external view returns (bool) {
        return hasLiked[user][commentId];
    }
    
    /**
     * @dev 获取用户活动
     */
    function getUserActivity(address user, uint256 offset, uint256 limit) external view returns (
        uint256[] memory commentIds,
        uint256[] memory likedCommentIds
    ) {
        // 获取用户评论
        uint256[] memory userCommentList = userComments[user];
        uint256 total = userCommentList.length;
        
        if (offset >= total) {
            commentIds = new uint256[](0);
        } else {
            uint256 end = offset + limit;
            if (end > total) {
                end = total;
            }
            
            commentIds = new uint256[](end - offset);
            for (uint256 i = 0; i < end - offset; i++) {
                commentIds[i] = userCommentList[offset + i];
            }
        }
        
        // 获取点赞的评论（简化实现）
        uint256 likedCount = 0;
        likedCommentIds = new uint256[](limit);
        
        for (uint256 i = 0; i < commentIdCounter && likedCount < limit; i++) {
            if (hasLiked[user][i]) {
                likedCommentIds[likedCount++] = i;
            }
        }
        
        // 调整数组大小
        assembly {
            mstore(likedCommentIds, likedCount)
        }
    }
    
    //成功通知Campaign事件
    event CampaignCommentPosted(address indexed campaign, address indexed user, uint256 indexed commentId);
    //忽略错误1，继续下一个Campaign事件
    event IgnoredCampaign1(address indexed campaign);
    // 忽略错误2，继续下一个Campaign事件
    event IgnoredCampaign2(address indexed campaign);
    
    
    // ====== 内部函数 ======
    
    /**
     * @dev 通知所有活跃Campaign有新评论
     */
    // function _notifyCampaignsCommentPosted(address user, uint256 commentId) private {
    //     for (uint256 i = 0; i < campaigns.length; i++) {
    //         try ICampaign(campaigns[i]).onCommentPosted(user, commentId) {
    //             // 成功通知Campaign
    //             emit CampaignCommentPosted(campaigns[i], user, commentId);
    //         } catch (bytes memory lowLevelData){
    //             // 忽略错误1，继续下一个Campaign
    //             emit IgnoredCampaign1(campaigns[i]);
    //             if (lowLevelData.length > 0) {
    //                 assembly {
    //                     revert(add(32, lowLevelData), mload(lowLevelData))
    //                 }
    //             } else {
    //                 revert("Low-level call failed");
    //             }
    //         }
    //     }
    // }
    function _notifyCampaignsCommentPosted(address user, uint256 commentId) private {
        for (uint256 i = 0; i < campaigns.length; i++) {
            ICampaign(campaigns[i]).onCommentPosted(user, commentId);
        }
    }
    
    /**
     * @dev 通知所有活跃Campaign有新点赞
     */
    function _notifyCampaignsCommentLiked(address liker, address author, uint256 commentId) private {
        for (uint256 i = 0; i < campaigns.length; i++) {
            ICampaign(campaigns[i]).onCommentLiked(liker, author, commentId);
        }
    }
    
    // ====== 兼容性函数 (保留旧接口，避免前端报错) ======
    
    /**
     * @dev 兼容性函数 - 返回空的奖池信息
     */
    function getPoolInfo() external pure returns (
        Sponsorship[] memory sponsorships,
        uint256 totalUSDValue
    ) {
        sponsorships = new Sponsorship[](0);
        totalUSDValue = 0;
    }
    
    /**
     * @dev 兼容性函数 - 返回所有Campaign的奖池总额
     */
    function getPoolValueUSD() external view returns (uint256) {
        if (campaigns.length == 0) return 0;
        
        address[] memory tokens = new address[](campaigns.length);
        uint256[] memory amounts = new uint256[](campaigns.length);
        
        for (uint256 i = 0; i < campaigns.length; i++) {
            try ICampaign(campaigns[i]).rewardToken() returns (address token) {
                tokens[i] = token;
                try ICampaign(campaigns[i]).totalRewardPool() returns (uint256 amount) {
                    amounts[i] = amount;
                } catch {
                    amounts[i] = 0;
                }
            } catch {
                tokens[i] = address(0);
                amounts[i] = 0;
            }
        }
        
        try IPriceOracle(priceOracle).getBatchUSDValue(tokens, amounts) returns (uint256 totalValue) {
            return totalValue;
        } catch {
            return 0;
        }
    }
    
    /**
     * @dev 兼容性函数 - 返回空的用户统计
     */
    function getUserStats(address) external pure returns (UserStats memory stats) {
        stats = UserStats({
            totalComments: 0,
            totalLikes: 0,
            totalCRT: 0,
            claimedRewards: 0
        });
    }
    
    /**
     * @dev 兼容性函数 - 返回空的CRT分解
     */
    function getUserCRTBreakdown(address) external pure returns (
        uint256 commentTokens,
        uint256 likeTokens
    ) {
        commentTokens = 0;
        likeTokens = 0;
    }
    
    /**
     * @dev 兼容性函数 - 返回空的详细活动
     */
    function getUserDetailedActivity(address, uint256, uint256) external pure returns (
        Comment[] memory projectComments,
        Comment[] memory likedComments
    ) {
        projectComments = new Comment[](0);
        likedComments = new Comment[](0);
    }
    
    /**
     * @dev 兼容性函数 - 返回空的精英评论
     */
    function getEliteComments() external pure returns (Comment[] memory) {
        return new Comment[](0);
    }
    
    /**
     * @dev 兼容性函数 - 返回空的待领取奖励
     */
    function getPendingRewards(address) external pure returns (
        address[] memory tokens,
        uint256[] memory amounts
    ) {
        tokens = new address[](0);
        amounts = new uint256[](0);
    }
    
    /**
     * @dev 兼容性函数 - 空实现
     */
    function setCRTToken(address) external pure {
        // 空实现，保持兼容性
    }
    
    /**
     * @dev 兼容性函数 - 空实现
     */
    function sponsor(address, uint256) external pure {
        revert("Use Campaign system instead");
    }
    
    /**
     * @dev 兼容性函数 - 空实现
     */
    function distributeRewards() external pure {
        revert("Use Campaign system instead");
    }
    
    /**
     * @dev 兼容性函数 - 空实现
     */
    function claimRewards(address[] calldata) external pure {
        revert("Use Campaign system instead");
    }
} 