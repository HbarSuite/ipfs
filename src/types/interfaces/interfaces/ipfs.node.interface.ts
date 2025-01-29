import { IPFSHTTPClient } from 'ipfs-http-client'
import { _IBase } from './ipfs.base.interface';
import { IAuth } from '@hsuite/auth-types';

/**
 * Interface for IPFS Node provider
 * Defines direct IPFS node interaction functionality
 * 
 * @interface _INode
 * @description
 * This interface extends the base IPFS interface with methods specific to
 * direct IPFS node interaction. It provides functionality for:
 * - IPFS client management
 * - Content pinning and unpinning
 * - Node status monitoring
 * - Network operations
 * 
 * @extends _IBase Base IPFS interface
 */
export interface _INode extends _IBase {
    /**
     * Gets the IPFS HTTP client instance
     * Provides access to the underlying IPFS client
     * 
     * @returns {IPFSHTTPClient} The IPFS HTTP client instance
     * @description
     * Returns the configured IPFS client for direct node operations.
     * This client provides low-level access to IPFS functionality.
     */
    get client(): IPFSHTTPClient;

    /**
     * Sets the IPFS HTTP client instance
     * Configures the IPFS client for node operations
     * 
     * @param {IPFSHTTPClient} client - The IPFS HTTP client to set
     * @description
     * Updates the IPFS client instance used for node operations.
     * Should be called during initialization or when reconfiguring the node.
     */
    set client(client: IPFSHTTPClient);

    /**
     * Gets the status of the IPFS node
     * Retrieves node health and network information
     * 
     * @returns {Promise<any>} The node status information
     * @throws {Error} When status cannot be retrieved
     * 
     * @description
     * Returns information about:
     * - Node ID and addresses
     * - Connected peers
     * - Network status
     * - Bandwidth usage
     */
    getStatus(): Promise<any>;

    /**
     * Pins content to IPFS
     * Stores content permanently on the IPFS network
     * 
     * @param {string} content - The content to pin
     * @param {IAuth.ICredentials.IWeb3.IEntity} owner - The owner credentials
     * @param {boolean} broadcast - Whether to broadcast the pin
     * @returns {Promise<string>} The CID of the pinned content
     * @throws {Error} When pinning fails or content is invalid
     * 
     * @description
     * This method:
     * 1. Adds content to IPFS
     * 2. Pins it to ensure persistence
     * 3. Records ownership information
     * 4. Optionally broadcasts to the network
     */
    pin(content: string, owner: IAuth.ICredentials.IWeb3.IEntity, broadcast: boolean): Promise<string>;

    /**
     * Unpins content from IPFS
     * Removes content from permanent storage
     * 
     * @param {string} CID - The Content Identifier to unpin
     * @param {IAuth.ICredentials.IWeb3.IEntity} owner - The owner credentials
     * @returns {Promise<boolean>} Whether the unpin was successful
     * @throws {Error} When unpinning fails or user is unauthorized
     * 
     * @description
     * This method:
     * 1. Verifies ownership of the content
     * 2. Removes the pin from IPFS
     * 3. Updates pin records
     * 4. Returns success status
     */
    unpin(CID: string, owner: IAuth.ICredentials.IWeb3.IEntity): Promise<boolean>;
}