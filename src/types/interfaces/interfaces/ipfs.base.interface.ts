import core from 'file-type/core'

/**
 * Base interface for IPFS providers
 * Defines common functionality for both Node and Gateway providers
 * 
 * @interface _IBase
 * @description
 * This interface defines the core functionality that all IPFS providers must implement.
 * It includes essential operations for:
 * - Provider type identification
 * - CID extraction and handling
 * - File retrieval and processing
 * - Content access and management
 */
export interface _IBase {
    /**
     * Type of IPFS provider - either 'node' or 'gateway'
     * Used to identify the provider implementation
     * 
     * @type {'node' | 'gateway'}
     * @description
     * - 'node': Direct IPFS node access provider
     * - 'gateway': HTTP gateway access provider
     */
    type: 'node' | 'gateway';

    /**
     * Extracts the CID (Content Identifier) from an IPFS URL
     * Handles various IPFS URL formats and protocols
     * 
     * @param {string} url - The IPFS URL to extract the CID from
     * @returns {string} The extracted CID
     * @throws {Error} When URL is invalid or CID cannot be extracted
     */
    extractCID(url: string): string;

    /**
     * Retrieves a file from IPFS and returns its buffer and file type
     * Handles file download and type detection
     * 
     * @param {string} ipfsUrl - The IPFS URL of the file to retrieve
     * @returns {Promise<{data: { buffer: Buffer, type: core.FileTypeResult }}>} Object containing file buffer and type information
     * @throws {Error} When file cannot be retrieved or processed
     */
    getFile(ipfsUrl: string): Promise<{data: { buffer: Buffer, type: core.FileTypeResult }}>;

    /**
     * Retrieves data from IPFS using a CID
     * Handles content retrieval and processing
     * 
     * @param {string} CID - The Content Identifier of the data to retrieve
     * @returns {Promise<{ data: any }>} The retrieved data
     * @throws {Error} When content cannot be retrieved or is invalid
     */
    get(CID: string): Promise<{ data: any }>;
}