// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CareProofRegistry
 * @author TechHavenLabs
 * @notice Registers and manages off-chain healthcare record hashes on-chain.
 *         Only the cryptographic hash is stored — no personal health information
 *         is written to the blockchain.
 *
 * Record IDs start at 1. ID 0 is intentionally unused so that a zero value
 * can be used as a sentinel meaning "not registered".
 */
contract CareProofRegistry {
    // ─── Structs ────────────────────────────────────────────────────────────

    struct Record {
        bytes32 dataHash;
        address owner;
        address creator;
        uint256 createdAt;
        bool    active;
    }

    // ─── Storage ─────────────────────────────────────────────────────────────

    /// @dev recordId → Record
    mapping(uint256 => Record) private _records;

    /// @dev recordId → viewer address → hasAccess
    mapping(uint256 => mapping(address => bool)) private _recordAccess;

    /// @dev Auto-incrementing counter. First real record gets ID 1.
    uint256 private _nextRecordId = 1;

    // ─── Custom Errors ───────────────────────────────────────────────────────

    error ZeroHash();
    error ZeroAddress();
    error RecordDoesNotExist(uint256 recordId);
    error NotOwner(uint256 recordId, address caller);
    error RecordInactive(uint256 recordId);
    error AccessAlreadyGranted(uint256 recordId, address viewer);
    error AccessNotGranted(uint256 recordId, address viewer);
    error CannotGrantToOwner(uint256 recordId, address owner);
    error AlreadyDeactivated(uint256 recordId);

    // ─── Events ───────────────────────────────────────────────────────────────

    event RecordRegistered(
        uint256 indexed recordId,
        bytes32 indexed dataHash,
        address indexed owner,
        address creator,
        uint256 timestamp
    );

    event AccessGranted(
        uint256 indexed recordId,
        address indexed owner,
        address indexed viewer,
        uint256 timestamp
    );

    event AccessRevoked(
        uint256 indexed recordId,
        address indexed owner,
        address indexed viewer,
        uint256 timestamp
    );

    event RecordDeactivated(
        uint256 indexed recordId,
        address indexed owner,
        uint256 timestamp
    );

    // ─── Write Functions ──────────────────────────────────────────────────────

    /**
     * @notice Register a new record hash.
     * @param dataHash  keccak256 hash of the normalised off-chain record.
     * @param owner     Wallet address that owns the record.
     * @return recordId The assigned record identifier.
     */
    function registerRecord(
        bytes32 dataHash,
        address owner
    ) external returns (uint256 recordId) {
        if (dataHash == bytes32(0)) revert ZeroHash();
        if (owner == address(0))   revert ZeroAddress();

        recordId = _nextRecordId++;

        _records[recordId] = Record({
            dataHash:  dataHash,
            owner:     owner,
            creator:   msg.sender,
            createdAt: block.timestamp,
            active:    true
        });

        emit RecordRegistered(recordId, dataHash, owner, msg.sender, block.timestamp);
    }

    /**
     * @notice Grant read access to a viewer wallet.
     */
    function grantAccess(uint256 recordId, address viewer) external {
        Record storage rec = _requireOwner(recordId);
        if (!rec.active)                         revert RecordInactive(recordId);
        if (viewer == address(0))                revert ZeroAddress();
        if (viewer == rec.owner)                 revert CannotGrantToOwner(recordId, viewer);
        if (_recordAccess[recordId][viewer])     revert AccessAlreadyGranted(recordId, viewer);

        _recordAccess[recordId][viewer] = true;
        emit AccessGranted(recordId, rec.owner, viewer, block.timestamp);
    }

    /**
     * @notice Revoke previously granted access.
     */
    function revokeAccess(uint256 recordId, address viewer) external {
        Record storage rec = _requireOwner(recordId);
        if (viewer == address(0))                revert ZeroAddress();
        if (!_recordAccess[recordId][viewer])    revert AccessNotGranted(recordId, viewer);

        _recordAccess[recordId][viewer] = false;
        emit AccessRevoked(recordId, rec.owner, viewer, block.timestamp);
    }

    /**
     * @notice Deactivate a record. History and hash remain on-chain.
     */
    function deactivateRecord(uint256 recordId) external {
        Record storage rec = _requireOwner(recordId);
        if (!rec.active) revert AlreadyDeactivated(recordId);

        rec.active = false;
        emit RecordDeactivated(recordId, rec.owner, block.timestamp);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Retrieve all stored fields of a record.
     */
    function getRecord(uint256 recordId)
        external
        view
        returns (
            bytes32 dataHash,
            address owner,
            address creator,
            uint256 createdAt,
            bool    active
        )
    {
        _requireExists(recordId);
        Record storage rec = _records[recordId];
        return (rec.dataHash, rec.owner, rec.creator, rec.createdAt, rec.active);
    }

    /**
     * @notice Check whether the stored hash matches an expected hash.
     */
    function verifyRecord(uint256 recordId, bytes32 expectedHash)
        external
        view
        returns (bool)
    {
        _requireExists(recordId);
        return _records[recordId].dataHash == expectedHash;
    }

    /**
     * @notice Check whether a viewer has been granted access.
     */
    function hasAccess(uint256 recordId, address viewer)
        external
        view
        returns (bool)
    {
        _requireExists(recordId);
        // Owner always has implicit access
        if (_records[recordId].owner == viewer) return true;
        return _recordAccess[recordId][viewer];
    }

    /**
     * @notice Return true when a record with the given ID has been registered.
     */
    function recordExists(uint256 recordId) external view returns (bool) {
        return _records[recordId].createdAt != 0;
    }

    /**
     * @notice Return the ID that will be assigned to the next registered record.
     */
    function nextRecordId() external view returns (uint256) {
        return _nextRecordId;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _requireExists(uint256 recordId) internal view {
        if (_records[recordId].createdAt == 0) revert RecordDoesNotExist(recordId);
    }

    function _requireOwner(uint256 recordId) internal view returns (Record storage) {
        _requireExists(recordId);
        Record storage rec = _records[recordId];
        if (rec.owner != msg.sender) revert NotOwner(recordId, msg.sender);
        return rec;
    }
}
