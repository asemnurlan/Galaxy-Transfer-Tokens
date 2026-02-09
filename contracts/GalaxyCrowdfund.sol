// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GalaxyRewardToken.sol"; 

contract GalaxyCrowdfund is ReentrancyGuard {
    struct Campaign { 
        address creator;
        string title;
        uint256 goalWei; 
        uint256 deadline;    
        uint256 raisedWei;   
        bool finalized;       
        bool successful;      
        bool creatorPaid;    
    }

    GalaxyRewardToken public immutable rewardToken;
    uint256 public rewardRate;
    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => mapping(address => bool)) public refunded;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 goalWei,
        uint256 deadline
    );

    event Contributed(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amountWei,
        uint256 rewardMinted
    );

    event CampaignFinalized(
        uint256 indexed campaignId,
        bool successful,
        uint256 raisedWei
    );

    event CreatorWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amountWei
    );

    event Refunded(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amountWei
    );

    error CampaignNotFound();
    error InvalidGoal();
    error InvalidDuration();
    error NotActive();
    error Ended();
    error NotEndedYet();
    error AlreadyFinalized();
    error NotFinalized();
    error NotCreator();
    error NotSuccessful();
    error AlreadyPaid();
    error NothingToRefund();
    error AlreadyRefunded();
    error TransferFailed();

    constructor(address rewardTokenAddress, uint256 initialRewardRate) {
        rewardToken = GalaxyRewardToken(rewardTokenAddress);
        rewardRate = initialRewardRate;
    }

    function createCampaign(
        string calldata title,
        uint256 goalWei,
        uint256 durationSeconds
    ) external returns (uint256 campaignId) {
        if (goalWei == 0) revert InvalidGoal();
        if (durationSeconds == 0) revert InvalidDuration();
        campaignId = ++campaignCount;
        uint256 deadline = block.timestamp + durationSeconds;
        campaigns[campaignId] = Campaign({
            creator: msg.sender,
            title: title,
            goalWei: goalWei,
            deadline: deadline,
            raisedWei: 0,
            finalized: false,
            successful: false,
            creatorPaid: false
        });

        emit CampaignCreated(campaignId, msg.sender, title, goalWei, deadline);
    }

    function contribute(uint256 campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.creator == address(0)) revert CampaignNotFound();
        if (c.finalized) revert NotActive();
        if (block.timestamp >= c.deadline) revert Ended();
        if (msg.value == 0) revert NotActive();
        c.raisedWei += msg.value;
        contributions[campaignId][msg.sender] += msg.value;
        uint256 rewardAmount = msg.value * rewardRate;
        rewardToken.mint(msg.sender, rewardAmount);
        emit Contributed(campaignId, msg.sender, msg.value, rewardAmount);
    }

    function finalize(uint256 campaignId) external {
        Campaign storage c = campaigns[campaignId];
        if (c.creator == address(0)) revert CampaignNotFound();
        if (c.finalized) revert AlreadyFinalized();
        if (block.timestamp < c.deadline) revert NotEndedYet();
        c.finalized = true;
        c.successful = (c.raisedWei >= c.goalWei);
        emit CampaignFinalized(campaignId, c.successful, c.raisedWei);
    }

    function withdrawCreator(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.creator == address(0)) revert CampaignNotFound();
        if (msg.sender != c.creator) revert NotCreator();
        if (!c.finalized) revert NotFinalized();
        if (!c.successful) revert NotSuccessful();
        if (c.creatorPaid) revert AlreadyPaid();
        c.creatorPaid = true;
        (bool ok, ) = payable(c.creator).call{value: c.raisedWei}("");
        if (!ok) revert TransferFailed();
        emit CreatorWithdrawn(campaignId, c.creator, c.raisedWei);
    }
    function refund(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        if (c.creator == address(0)) revert CampaignNotFound();
        if (!c.finalized) revert NotFinalized();
        if (c.successful) revert NotSuccessful(); // refunds only if unsuccessful

        uint256 amount = contributions[campaignId][msg.sender];
        if (amount == 0) revert NothingToRefund();
        if (refunded[campaignId][msg.sender]) revert AlreadyRefunded();

        refunded[campaignId][msg.sender] = true;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Refunded(campaignId, msg.sender, amount);
    }
    function getCampaign(uint256 campaignId)
        external
        view
        returns (
            address creator,
            string memory title,
            uint256 goalWei,
            uint256 deadline,
            uint256 raisedWei,
            bool finalized,
            bool successful,
            bool creatorPaid
        )
    {
        Campaign storage c = campaigns[campaignId];
        if (c.creator == address(0)) revert CampaignNotFound();
        return (
            c.creator,
            c.title,
            c.goalWei,
            c.deadline,
            c.raisedWei,
            c.finalized,
            c.successful,
            c.creatorPaid
        );
    }
}
