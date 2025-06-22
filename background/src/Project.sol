// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IProject.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/ICoinRealPlatform.sol";

contract Project is IProject, Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Constants
    uint256 private constant COMMENT_REWARD = 5 ether; // 5 CRT
    uint256 private constant LIKE_REWARD = 1 ether; // 1 CRT
    uint256 private constant MIN_SPONSOR_USD = 100 * 10**8; // $100 minimum
    uint256 private constant MAX_ELITE_COUNT = 10;
    
    // State variables
    string public name;
    string public symbol;
    string public description;
    string public category;
    address public creator;
    uint16 public drawPeriod; // in days
    uint256 public nextDrawTime;
    bool public isActive;
    
    address public crtToken;
    address public priceOracle;
    address public platform;
    
    // Comment tracking
    uint256 public commentIdCounter;
    mapping(uint256 => Comment) public comments;
    mapping(address => uint256[]) public userComments;
    mapping(address => mapping(uint256 => bool)) public hasLiked;
    
    // Elite comments tracking
    uint256[MAX_ELITE_COUNT] public eliteCommentIds;
    uint256 public eliteCount;
    
    // User stats
    mapping(address => UserStats) public userStats;
    address[] public participants;
    mapping(address => bool) public isParticipant;
    
    // Sponsorship tracking
    Sponsorship[] public sponsorships;
    mapping(address => uint256) public tokenPoolAmounts;
    address[] public poolTokens;
    mapping(address => bool) public isPoolToken;
    
    // Rewards distribution
    uint256 public lastDistributionTime;
    mapping(address => mapping(address => uint256)) public pendingRewards;
    
    // Stats
    uint256 public totalComments;
    uint256 public totalLikes;
    uint256 public lastActivityTime;
    
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
        uint16 _drawPeriod,
        address _creator,
        address _priceOracle,
        address _platform
    ) external initializer {
        require(bytes(_name).length > 0, "Name required");
        require(_drawPeriod > 0, "Invalid draw period");
        require(_creator != address(0), "Invalid creator");
        require(_priceOracle != address(0), "Invalid price oracle");
        require(_platform != address(0), "Invalid platform");
        
        name = _name;
        symbol = _symbol;
        description = _description;
        category = _category;
        creator = _creator;
        drawPeriod = _drawPeriod;
        priceOracle = _priceOracle;
        platform = _platform;
        
        nextDrawTime = block.timestamp + (_drawPeriod * 1 days);
        isActive = true;
        lastActivityTime = block.timestamp;
        
        emit ProjectInitialized(_name, _symbol, _creator);
    }
    
    function setCRTToken(address _crtToken) external {
        // 只有在初始化过程中才能设置CRT token
        require(crtToken == address(0), "CRT token already set");
        require(_crtToken != address(0), "Invalid CRT token");
        // 只允许platform调用，但由于是代理调用，需要检查platform变量
        require(platform != address(0), "Platform not initialized");
        crtToken = _crtToken;
    }
    
    function postComment(string calldata content) external onlyActive returns (uint256 commentId) {
        require(bytes(content).length > 0, "Content required");
        require(bytes(content).length <= 1000, "Content too long");
        
        commentId = commentIdCounter++;
        
        Comment storage comment = comments[commentId];
        comment.id = commentId;
        comment.author = msg.sender;
        comment.content = content;
        comment.timestamp = uint32(block.timestamp);
        comment.crtReward = COMMENT_REWARD;
        
        userComments[msg.sender].push(commentId);
        
        // Update user stats
        if (!isParticipant[msg.sender]) {
            isParticipant[msg.sender] = true;
            participants.push(msg.sender);
        }
        
        userStats[msg.sender].totalComments++;
        userStats[msg.sender].totalCRT += COMMENT_REWARD;
        
        totalComments++;
        lastActivityTime = block.timestamp;
        
        // Platform statistics tracking
        try ICoinRealPlatform(platform).recordUserActivity(msg.sender) {} catch {}
        try ICoinRealPlatform(platform).recordComment() {} catch {}
        
        // Mint CRT reward
        ICRTToken(crtToken).mint(msg.sender, COMMENT_REWARD);
        
        emit CommentPosted(commentId, msg.sender, content);
    }
    
    function likeComment(uint256 commentId) external onlyActive {
        require(commentId < commentIdCounter, "Invalid comment ID");
        require(!hasLiked[msg.sender][commentId], "Already liked");
        
        Comment storage comment = comments[commentId];
        require(comment.author != address(0), "Comment does not exist");
        
        hasLiked[msg.sender][commentId] = true;
        comment.likes++;
        comment.crtReward += LIKE_REWARD;
        
        // Update user stats
        if (!isParticipant[msg.sender]) {
            isParticipant[msg.sender] = true;
            participants.push(msg.sender);
        }
        
        userStats[msg.sender].totalLikes++;
        userStats[msg.sender].totalCRT += LIKE_REWARD;
        userStats[comment.author].totalCRT += LIKE_REWARD;
        
        totalLikes++;
        lastActivityTime = block.timestamp;
        
        // Platform statistics tracking
        try ICoinRealPlatform(platform).recordUserActivity(msg.sender) {} catch {}
        
        // Update elite comments
        _updateEliteComments(commentId);
        
        // Mint CRT rewards
        ICRTToken(crtToken).mint(msg.sender, LIKE_REWARD);
        ICRTToken(crtToken).mint(comment.author, LIKE_REWARD);
        
        emit CommentLiked(commentId, msg.sender);
    }
    
    function sponsor(address token, uint256 amount) external nonReentrant onlyActive {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check minimum USD value
        uint256 usdValue = IPriceOracle(priceOracle).getUSDValue(token, amount);
        require(usdValue >= MIN_SPONSOR_USD, "Below minimum sponsorship");
        
        // Transfer tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Track sponsorship
        sponsorships.push(Sponsorship({
            token: token,
            amount: amount,
            sponsor: msg.sender,
            timestamp: uint32(block.timestamp)
        }));
        
        tokenPoolAmounts[token] += amount;
        
        if (!isPoolToken[token]) {
            isPoolToken[token] = true;
            poolTokens.push(token);
        }
        
        emit SponsorshipAdded(msg.sender, token, amount);
    }
    
    function distributeRewards() external nonReentrant {
        require(block.timestamp >= nextDrawTime, "Draw period not ended");
        require(totalComments > 0, "No comments to distribute");
        require(participants.length > 0, "No participants");
        
        // Calculate total CRT for distribution
        uint256 totalCRT = 0;
        uint256 eliteCRT = 0;
        
        for (uint256 i = 0; i < participants.length; i++) {
            totalCRT += userStats[participants[i]].totalCRT;
        }
        
        // Mark elite comments (if any)
        for (uint256 i = 0; i < eliteCount; i++) {
            comments[eliteCommentIds[i]].isElite = true;
            eliteCRT += comments[eliteCommentIds[i]].crtReward;
        }
        
        // Distribute rewards for each token in pool
        for (uint256 i = 0; i < poolTokens.length; i++) {
            address token = poolTokens[i];
            uint256 poolAmount = tokenPoolAmounts[token];
            
            if (poolAmount > 0) {
                // Elite rewards (15%) - 精英评论奖励
                uint256 elitePool = (poolAmount * 15) / 100;
                if (eliteCRT > 0 && eliteCount > 0) {
                    for (uint256 j = 0; j < eliteCount; j++) {
                        Comment memory eliteComment = comments[eliteCommentIds[j]];
                        uint256 reward = (elitePool * eliteComment.crtReward) / eliteCRT;
                        pendingRewards[eliteComment.author][token] += reward;
                    }
                } else {
                    // If no elite comments, add to normal pool
                    elitePool = 0;
                }
                
                // Comment rewards (60%) - 评论奖励
                uint256 commentPool = (poolAmount * 60) / 100 + (elitePool > 0 ? 0 : (poolAmount * 15) / 100);
                if (totalCRT > 0) {
                    for (uint256 j = 0; j < participants.length; j++) {
                        address user = participants[j];
                        uint256 userCRT = userStats[user].totalCRT;
                        if (userCRT > 0) {
                            uint256 reward = (commentPool * userCRT) / totalCRT;
                            pendingRewards[user][token] += reward;
                        }
                    }
                }
                
                // Like rewards (25%) - 点赞奖励
                uint256 likePool = (poolAmount * 25) / 100;
                if (totalLikes > 0) {
                    for (uint256 j = 0; j < participants.length; j++) {
                        address user = participants[j];
                        uint256 userLikes = userStats[user].totalLikes;
                        if (userLikes > 0) {
                            uint256 reward = (likePool * userLikes) / totalLikes;
                            pendingRewards[user][token] += reward;
                        }
                    }
                }
                
                // Reset pool amount
                tokenPoolAmounts[token] = 0;
            }
        }
        
        // Update distribution time and next draw time
        lastDistributionTime = block.timestamp;
        nextDrawTime = block.timestamp + (drawPeriod * 1 days);
        
        // Reset stats for next period
        _resetPeriodStats();
        
        emit RewardsDistributed(block.timestamp, totalComments, totalLikes);
    }
    
    function claimRewards(address[] calldata tokens) external nonReentrant {
        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 amount = pendingRewards[msg.sender][token];
            
            if (amount > 0) {
                pendingRewards[msg.sender][token] = 0;
                userStats[msg.sender].claimedRewards += amount;
                IERC20(token).safeTransfer(msg.sender, amount);
            }
        }
    }
    
    // View functions
    function getComment(uint256 commentId) external view returns (Comment memory) {
        return comments[commentId];
    }
    
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
    
    function getEliteComments() external view returns (Comment[] memory eliteCommentList) {
        eliteCommentList = new Comment[](eliteCount);
        for (uint256 i = 0; i < eliteCount; i++) {
            eliteCommentList[i] = comments[eliteCommentIds[i]];
        }
    }
    
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    function getPoolInfo() external view returns (Sponsorship[] memory, uint256 totalUSDValue) {
        // Calculate total USD value only if there are pool tokens
        if (poolTokens.length > 0) {
            address[] memory tokens = new address[](poolTokens.length);
            uint256[] memory amounts = new uint256[](poolTokens.length);
            
            for (uint256 i = 0; i < poolTokens.length; i++) {
                tokens[i] = poolTokens[i];
                amounts[i] = tokenPoolAmounts[poolTokens[i]];
            }
            
            totalUSDValue = IPriceOracle(priceOracle).getBatchUSDValue(tokens, amounts);
        } else {
            totalUSDValue = 0;
        }
        
        return (sponsorships, totalUSDValue);
    }
    
    function getPendingRewards(address user) external view returns (address[] memory tokens, uint256[] memory amounts) {
        uint256 count = 0;
        for (uint256 i = 0; i < poolTokens.length; i++) {
            if (pendingRewards[user][poolTokens[i]] > 0) {
                count++;
            }
        }
        
        tokens = new address[](count);
        amounts = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < poolTokens.length; i++) {
            uint256 amount = pendingRewards[user][poolTokens[i]];
            if (amount > 0) {
                tokens[index] = poolTokens[i];
                amounts[index] = amount;
                index++;
            }
        }
    }
    
    function hasUserLikedComment(address user, uint256 commentId) external view returns (bool) {
        return hasLiked[user][commentId];
    }
    
    function getProjectStats() external view returns (
        uint256 totalParticipants,
        uint256 _totalLikes,
        uint256 _lastActivityTime,
        uint256 currentPoolUSD
    ) {
        totalParticipants = participants.length;
        _totalLikes = totalLikes;
        _lastActivityTime = lastActivityTime;
        
        // Calculate current pool USD value only if there are pool tokens
        if (poolTokens.length > 0) {
            address[] memory tokens = new address[](poolTokens.length);
            uint256[] memory amounts = new uint256[](poolTokens.length);
            
            for (uint256 i = 0; i < poolTokens.length; i++) {
                tokens[i] = poolTokens[i];
                amounts[i] = tokenPoolAmounts[poolTokens[i]];
            }
            
            currentPoolUSD = IPriceOracle(priceOracle).getBatchUSDValue(tokens, amounts);
        } else {
            currentPoolUSD = 0;
        }
    }
    
    function getUserActivity(address user, uint256 offset, uint256 limit) external view returns (
        uint256[] memory commentIds,
        uint256[] memory likedCommentIds
    ) {
        // Get user comments
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
        
        // Get liked comments (simplified - returns first 'limit' liked comments)
        uint256 likedCount = 0;
        likedCommentIds = new uint256[](limit);
        
        for (uint256 i = 0; i < commentIdCounter && likedCount < limit; i++) {
            if (hasLiked[user][i]) {
                likedCommentIds[likedCount++] = i;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(likedCommentIds, likedCount)
        }
    }
    
    // Internal functions
    function _updateEliteComments(uint256 commentId) private {
        uint256 newLikes = comments[commentId].likes;
        
        // Check if comment should be in elite list
        if (eliteCount < MAX_ELITE_COUNT) {
            // Add to elite list if not full
            eliteCommentIds[eliteCount++] = commentId;
            _sortEliteComments();
        } else {
            // Check if it should replace the lowest elite comment
            uint256 lowestEliteId = eliteCommentIds[MAX_ELITE_COUNT - 1];
            uint256 lowestLikes = comments[lowestEliteId].likes;
            
            if (newLikes > lowestLikes || 
                (newLikes == lowestLikes && commentId < lowestEliteId)) {
                eliteCommentIds[MAX_ELITE_COUNT - 1] = commentId;
                _sortEliteComments();
            }
        }
    }
    
    function _sortEliteComments() private {
        // Simple bubble sort for small fixed array
        for (uint256 i = 0; i < eliteCount - 1; i++) {
            for (uint256 j = 0; j < eliteCount - i - 1; j++) {
                uint256 id1 = eliteCommentIds[j];
                uint256 id2 = eliteCommentIds[j + 1];
                uint256 likes1 = comments[id1].likes;
                uint256 likes2 = comments[id2].likes;
                
                // Sort by likes desc, then by ID asc (earlier comments first)
                if (likes1 < likes2 || (likes1 == likes2 && id1 > id2)) {
                    eliteCommentIds[j] = id2;
                    eliteCommentIds[j + 1] = id1;
                }
            }
        }
    }
    
    function _resetPeriodStats() private {
        // Reset user stats for new period
        for (uint256 i = 0; i < participants.length; i++) {
            delete userStats[participants[i]];
        }
        
        // Clear participants
        delete participants;
        
        // Clear elite comments
        eliteCount = 0;
        
        // Reset comment rewards and elite status
        for (uint256 i = 0; i < commentIdCounter; i++) {
            comments[i].crtReward = COMMENT_REWARD;
            comments[i].isElite = false;
        }
        
        // Reset totals
        totalComments = 0;
        totalLikes = 0;
    }
}

interface ICRTToken {
    function mint(address to, uint256 amount) external;
} 