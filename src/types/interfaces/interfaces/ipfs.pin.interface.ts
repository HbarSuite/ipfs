/**
 * Interface representing a pinned IPFS content
 * Defines the structure for tracking pinned content
 * 
 * @interface _IPin
 * @description
 * This interface defines the data structure for tracking pinned content on IPFS.
 * It includes essential information for:
 * - Content identification
 * - Ownership tracking
 * - Temporal metadata
 * 
 * Used in conjunction with MongoDB for persistent storage of pin records.
 */
export interface _IPin {
    /**
     * The Content Identifier (CID) of the pinned content
     * Unique identifier for IPFS content
     * 
     * @type {string}
     * @description
     * IPFS Content Identifier that:
     * - Uniquely identifies the content
     * - Is cryptographically generated
     * - Is immutable
     * - Follows the CIDv0 or CIDv1 format
     */
    cid: string;

    /**
     * The address/identifier of the content owner
     * Wallet or account ID of the content owner
     * 
     * @type {string}
     * @description
     * Identifier of the entity that owns the content:
     * - Usually a blockchain wallet address
     * - Used for access control
     * - Required for unpinning operations
     */
    owner: string;

    /**
     * Unix timestamp of when the content was pinned
     * Records the pinning operation time
     * 
     * @type {number}
     * @description
     * Unix timestamp (milliseconds) that:
     * - Records when content was pinned
     * - Used for tracking pin duration
     * - Helps in pin management
     * - Enables time-based operations
     */
    timestamp: number;
}