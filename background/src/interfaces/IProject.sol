// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IProject {
    // Events
    event ProjectInitialized(string name, string symbol, address creator);
    event CommentPosted(uint256 indexed commentId, address indexed user, string content);
    event CommentLiked(uint256 indexed commentId, address indexed liker);
    event SponsorshipAdded(address indexed sponsor, address token, uint256 amount);
    event RewardsDistributed(uint256 timestamp, uint256 totalComments, uint256 totalLikes);
    
    // Structs
    struct Comment {
        uint256 id;
        address author;
        string content;
        uint256 likes;
        uint256 crtReward;
        bool isElite;
        uint32 timestamp;
    }
    
    struct Sponsorship {
        address token;
        uint256 amount;
        address sponsor;
        uint32 timestamp;
    }
    
    struct UserStats {
        uint256 totalComments;
        uint256 totalLikes;
        uint256 totalCRT;
        uint256 claimedRewards;
    }
    
    // Functions
    function initialize(
        string calldata _name,
        string calldata _symbol,
        string calldata _description,
        string calldata _category,
        uint16 _drawPeriod,
        address _creator,
        address _priceOracle
    ) external;
    
    function setCRTToken(address _crtToken) external;
    
    function postComment(string calldata content) external returns (uint256 commentId);
    function likeComment(uint256 commentId) external;
    function sponsor(address token, uint256 amount) external;
    function distributeRewards() external;
    function claimRewards(address[] calldata tokens) external;
    
    // Basic getters
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function description() external view returns (string memory);
    function category() external view returns (string memory);
    function creator() external view returns (address);
    function isActive() external view returns (bool);
    function totalComments() external view returns (uint256);
    function nextDrawTime() external view returns (uint256);
    
    // View functions
    function getComment(uint256 commentId) external view returns (Comment memory);
    function getComments(uint256 offset, uint256 limit) external view returns (Comment[] memory comments, uint256 total);
    function getEliteComments() external view returns (Comment[] memory eliteComments);
    function getUserStats(address user) external view returns (UserStats memory stats);
    function getPoolInfo() external view returns (Sponsorship[] memory sponsorships, uint256 totalUSDValue);
    function getPendingRewards(address user) external view returns (address[] memory tokens, uint256[] memory amounts);
    function hasUserLikedComment(address user, uint256 commentId) external view returns (bool);
    function getProjectStats() external view returns (uint256 totalParticipants, uint256 totalLikes, uint256 lastActivityTime, uint256 currentPoolUSD);
    function getUserActivity(address user, uint256 offset, uint256 limit) external view returns (uint256[] memory commentIds, uint256[] memory likedCommentIds);
} 