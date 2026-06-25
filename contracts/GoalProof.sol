// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title GoalProof
/// @notice A non-financial commit-reveal football prediction reputation ledger.
/// @dev Scores and results are authoritative on-chain; leaderboard ordering is intentionally off-chain.
contract GoalProof is AccessControl, Pausable {
    bytes32 public constant MATCH_MANAGER_ROLE = keccak256("MATCH_MANAGER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint8 public constant EXACT_SCORE_POINTS = 5;
    uint8 public constant CORRECT_OUTCOME_POINTS = 3;
    uint8 public constant WRONG_POINTS = 0;
    uint8 public constant MAX_ALLOWED_SCORE = 30;

    struct MatchData {
        string homeTeam;
        string awayTeam;
        uint64 kickoffTime;
        uint64 commitDeadline;
        uint64 revealDeadline;
        uint8 actualHomeScore;
        uint8 actualAwayScore;
        bool resultSubmitted;
        bool canceled;
        uint32 revealCount;
    }

    struct Prediction {
        bytes32 commitment;
        bytes32 reasonHash;
        uint64 committedAt;
        uint64 revealedAt;
        uint8 predictedHomeScore;
        uint8 predictedAwayScore;
        uint8 pointsAwarded;
        bool revealed;
    }

    error InvalidAdmin();
    error InvalidMatchId(uint256 matchId);
    error EmptyTeamName();
    error IdenticalTeams();
    error InvalidTimeConfiguration();
    error MatchCanceledError(uint256 matchId);
    error MatchAlreadyCanceled(uint256 matchId);
    error CommitPeriodClosed(uint256 matchId);
    error PredictionAlreadyCommitted(uint256 matchId, address user);
    error ZeroCommitment();
    error ZeroReasonHash();
    error MatchNotStarted(uint256 matchId);
    error ResultAlreadySubmitted(uint256 matchId);
    error ResultNotSubmitted(uint256 matchId);
    error RevealPeriodClosed(uint256 matchId);
    error PredictionNotCommitted(uint256 matchId, address user);
    error PredictionAlreadyRevealed(uint256 matchId, address user);
    error CommitmentMismatch();
    error ScoreOutOfRange(uint8 score);

    event MatchCreated(
        uint256 indexed matchId,
        string homeTeam,
        string awayTeam,
        uint64 kickoffTime,
        uint64 commitDeadline,
        uint64 revealDeadline
    );
    event MatchCanceled(uint256 indexed matchId);
    event PredictionCommitted(
        uint256 indexed matchId,
        address indexed user,
        bytes32 commitment,
        uint64 committedAt
    );
    event PredictionReasonCommitted(
        uint256 indexed matchId,
        address indexed user,
        bytes32 reasonHash
    );
    event ResultSubmitted(
        uint256 indexed matchId,
        uint8 actualHomeScore,
        uint8 actualAwayScore,
        address indexed oracle
    );
    event PredictionRevealed(
        uint256 indexed matchId,
        address indexed user,
        uint8 predictedHomeScore,
        uint8 predictedAwayScore,
        uint8 pointsAwarded
    );
    event ScoreAwarded(
        address indexed user,
        uint256 indexed matchId,
        uint8 points,
        uint256 newTotalScore
    );

    uint256 public matchCount;
    mapping(uint256 matchId => MatchData matchData) private _matches;
    mapping(uint256 matchId => mapping(address user => Prediction prediction)) private _predictions;
    mapping(address user => uint256 totalScore) public totalScores;
    mapping(address user => uint256 validRevealCount) public validRevealCounts;
    mapping(address user => uint256 exactScoreCount) public exactScoreCounts;

    /// @notice Creates a GoalProof instance and grants all operational roles to `admin`.
    /// @param admin Initial administrator, match manager, oracle, and pauser.
    constructor(address admin) {
        if (admin == address(0)) revert InvalidAdmin();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MATCH_MANAGER_ROLE, admin);
        _grantRole(ORACLE_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /// @notice Creates a new fixture with explicit commit, kickoff, and reveal boundaries.
    /// @return matchId Sequential identifier beginning at one.
    function createMatch(
        string calldata homeTeam,
        string calldata awayTeam,
        uint64 kickoffTime,
        uint64 commitDeadline,
        uint64 revealDeadline
    ) external onlyRole(MATCH_MANAGER_ROLE) returns (uint256 matchId) {
        if (bytes(homeTeam).length == 0 || bytes(awayTeam).length == 0) revert EmptyTeamName();
        if (keccak256(bytes(homeTeam)) == keccak256(bytes(awayTeam))) revert IdenticalTeams();
        if (
            commitDeadline <= block.timestamp || kickoffTime < commitDeadline
                || revealDeadline <= kickoffTime
        ) revert InvalidTimeConfiguration();

        matchId = ++matchCount;
        _matches[matchId] = MatchData({
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            kickoffTime: kickoffTime,
            commitDeadline: commitDeadline,
            revealDeadline: revealDeadline,
            actualHomeScore: 0,
            actualAwayScore: 0,
            resultSubmitted: false,
            canceled: false,
            revealCount: 0
        });

        emit MatchCreated(
            matchId, homeTeam, awayTeam, kickoffTime, commitDeadline, revealDeadline
        );
    }

    /// @notice Cancels an unresolved match. Existing commitments remain visible but cannot settle.
    function cancelMatch(uint256 matchId) external onlyRole(MATCH_MANAGER_ROLE) {
        MatchData storage matchData = _requireMatch(matchId);
        if (matchData.canceled) revert MatchAlreadyCanceled(matchId);
        if (matchData.resultSubmitted) revert ResultAlreadySubmitted(matchId);
        matchData.canceled = true;
        emit MatchCanceled(matchId);
    }

    /// @notice Stores one opaque prediction commitment for the caller before the deadline.
    function commitPrediction(uint256 matchId, bytes32 commitment) external whenNotPaused {
        _commitPrediction(matchId, commitment, bytes32(0));
    }

    /// @notice Stores one opaque prediction commitment plus an optional off-chain reason hash.
    function commitPredictionWithReason(
        uint256 matchId,
        bytes32 commitment,
        bytes32 reasonHash
    ) external whenNotPaused {
        if (reasonHash == bytes32(0)) revert ZeroReasonHash();
        _commitPrediction(matchId, commitment, reasonHash);
    }

    function _commitPrediction(
        uint256 matchId,
        bytes32 commitment,
        bytes32 reasonHash
    ) private {
        MatchData storage matchData = _activeMatch(matchId);
        if (block.timestamp >= matchData.commitDeadline) revert CommitPeriodClosed(matchId);
        if (commitment == bytes32(0)) revert ZeroCommitment();

        Prediction storage prediction = _predictions[matchId][msg.sender];
        if (prediction.commitment != bytes32(0)) {
            revert PredictionAlreadyCommitted(matchId, msg.sender);
        }

        prediction.commitment = commitment;
        prediction.reasonHash = reasonHash;
        prediction.committedAt = uint64(block.timestamp);
        emit PredictionCommitted(matchId, msg.sender, commitment, uint64(block.timestamp));
        if (reasonHash != bytes32(0)) {
            emit PredictionReasonCommitted(matchId, msg.sender, reasonHash);
        }
    }

    /// @notice Records the immutable final score after kickoff.
    function submitResult(
        uint256 matchId,
        uint8 actualHomeScore,
        uint8 actualAwayScore
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        MatchData storage matchData = _activeMatch(matchId);
        if (block.timestamp < matchData.kickoffTime) revert MatchNotStarted(matchId);
        if (matchData.resultSubmitted) revert ResultAlreadySubmitted(matchId);
        _validateScore(actualHomeScore);
        _validateScore(actualAwayScore);

        matchData.actualHomeScore = actualHomeScore;
        matchData.actualAwayScore = actualAwayScore;
        matchData.resultSubmitted = true;
        emit ResultSubmitted(matchId, actualHomeScore, actualAwayScore, msg.sender);
    }

    /// @notice Reveals a committed score, verifies it, and settles points atomically.
    /// @return pointsAwarded Points awarded under the public scoring rules.
    function revealPrediction(
        uint256 matchId,
        uint8 predictedHomeScore,
        uint8 predictedAwayScore,
        bytes32 salt
    ) external whenNotPaused returns (uint8 pointsAwarded) {
        MatchData storage matchData = _activeMatch(matchId);
        if (!matchData.resultSubmitted) revert ResultNotSubmitted(matchId);
        if (block.timestamp > matchData.revealDeadline) revert RevealPeriodClosed(matchId);
        _validateScore(predictedHomeScore);
        _validateScore(predictedAwayScore);

        Prediction storage prediction = _predictions[matchId][msg.sender];
        if (prediction.commitment == bytes32(0)) {
            revert PredictionNotCommitted(matchId, msg.sender);
        }
        if (prediction.revealed) revert PredictionAlreadyRevealed(matchId, msg.sender);
        if (
            computeCommitment(
                msg.sender, matchId, predictedHomeScore, predictedAwayScore, salt
            ) != prediction.commitment
        ) revert CommitmentMismatch();

        pointsAwarded = calculatePoints(
            predictedHomeScore,
            predictedAwayScore,
            matchData.actualHomeScore,
            matchData.actualAwayScore
        );
        prediction.revealedAt = uint64(block.timestamp);
        prediction.predictedHomeScore = predictedHomeScore;
        prediction.predictedAwayScore = predictedAwayScore;
        prediction.pointsAwarded = pointsAwarded;
        prediction.revealed = true;

        ++matchData.revealCount;
        ++validRevealCounts[msg.sender];
        if (pointsAwarded == EXACT_SCORE_POINTS) ++exactScoreCounts[msg.sender];
        totalScores[msg.sender] += pointsAwarded;

        emit PredictionRevealed(
            matchId, msg.sender, predictedHomeScore, predictedAwayScore, pointsAwarded
        );
        emit ScoreAwarded(msg.sender, matchId, pointsAwarded, totalScores[msg.sender]);
    }

    /// @notice Reproduces the domain-separated prediction commitment.
    function computeCommitment(
        address user,
        uint256 matchId,
        uint8 predictedHomeScore,
        uint8 predictedAwayScore,
        bytes32 salt
    ) public view returns (bytes32) {
        return keccak256(
            abi.encode(
                block.chainid,
                address(this),
                user,
                matchId,
                predictedHomeScore,
                predictedAwayScore,
                salt
            )
        );
    }

    /// @notice Applies exact-score and correct-outcome scoring.
    function calculatePoints(
        uint8 predictedHomeScore,
        uint8 predictedAwayScore,
        uint8 actualHomeScore,
        uint8 actualAwayScore
    ) public pure returns (uint8) {
        if (
            predictedHomeScore == actualHomeScore && predictedAwayScore == actualAwayScore
        ) return EXACT_SCORE_POINTS;

        bool predictedDraw = predictedHomeScore == predictedAwayScore;
        bool actualDraw = actualHomeScore == actualAwayScore;
        bool predictedHomeWin = predictedHomeScore > predictedAwayScore;
        bool actualHomeWin = actualHomeScore > actualAwayScore;
        if ((predictedDraw && actualDraw) || (predictedHomeWin && actualHomeWin)) {
            return CORRECT_OUTCOME_POINTS;
        }
        bool predictedAwayWin = predictedHomeScore < predictedAwayScore;
        bool actualAwayWin = actualHomeScore < actualAwayScore;
        return predictedAwayWin && actualAwayWin ? CORRECT_OUTCOME_POINTS : WRONG_POINTS;
    }

    /// @notice Returns the complete public state for a fixture.
    function getMatch(uint256 matchId) external view returns (MatchData memory) {
        if (matchId == 0 || matchId > matchCount) revert InvalidMatchId(matchId);
        return _matches[matchId];
    }

    /// @notice Returns one wallet's commitment and reveal state for a fixture.
    function getPrediction(
        uint256 matchId,
        address user
    ) external view returns (Prediction memory) {
        if (matchId == 0 || matchId > matchCount) revert InvalidMatchId(matchId);
        return _predictions[matchId][user];
    }

    /// @notice Pauses commit, result, and reveal writes during an emergency.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Resumes commit, result, and reveal writes.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _requireMatch(uint256 matchId) private view returns (MatchData storage matchData) {
        if (matchId == 0 || matchId > matchCount) revert InvalidMatchId(matchId);
        return _matches[matchId];
    }

    function _activeMatch(uint256 matchId) private view returns (MatchData storage matchData) {
        matchData = _requireMatch(matchId);
        if (matchData.canceled) revert MatchCanceledError(matchId);
    }

    function _validateScore(uint8 score) private pure {
        if (score > MAX_ALLOWED_SCORE) revert ScoreOutOfRange(score);
    }
}
