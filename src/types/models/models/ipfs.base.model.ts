import core from 'file-type/core'
import { IIPFS } from '../../interfaces/ipfs.interface.namespace';
import * as lodash from 'lodash'

/**
 * Abstract base class for IPFS providers implementing common functionality
 * Provides core IPFS operations shared between Node and Gateway providers
 * 
 * @abstract
 * @class _Base
 * @implements {IIPFS.IBase}
 * @description
 * This abstract class implements common IPFS functionality including:
 * - CID extraction and validation
 * - File retrieval and type detection
 * - Content access methods
 * 
 * It serves as the foundation for both Node and Gateway provider implementations.
 */
export abstract class _Base implements IIPFS.IBase {
    /**
     * Type of IPFS provider - either 'node' or 'gateway'
     * Identifies the provider implementation type
     * 
     * @type {'node' | 'gateway'}
     * @description
     * Provider type identifier that:
     * - Distinguishes between node and gateway implementations
     * - Determines available functionality
     * - Affects operation behavior
     */
    type: 'node' | 'gateway';

    /**
     * Extracts the CID (Content Identifier) from an IPFS URL
     * Handles various IPFS URL formats and protocols
     * 
     * @param {string} url - The IPFS URL to extract the CID from
     * @returns {string} The extracted CID or null if URL is empty
     * @description
     * This method handles multiple URL formats:
     * - ipfs:// protocol URLs
     * - HTTP gateway URLs
     * - dweb.link URLs
     * - Direct CID strings
     * 
     * @example
     * Supported URL formats:
     * - ipfs://QmHash
     * - https://ipfs.io/ipfs/QmHash
     * - https://QmHash.ipfs.dweb.link/
     * - QmHash
     */
    extractCID(
        url: string
    ): string {
        if(url) {
            const regex = new RegExp('(https:\/\/[^?]+\/ipfs\/)?([^?]+)', '');
            let CID = regex.exec(url.replace('ipfs://', ''));
            let cid = lodash.nth(CID, 2);
      
            if(cid.endsWith('ipfs.dweb.link/')) {
              const dweb = new RegExp('https:\/\/([^?]+)\.ipfs\.dweb\.link\/', '');
              let match = dweb.exec(cid);
              cid = lodash.nth(match, 1);
            }
            
            return cid;
          } else {
            return null;
          }
    }

    /**
     * Retrieves a file from IPFS and returns its buffer and file type
     * Must be implemented by concrete provider classes
     * 
     * @abstract
     * @param {string} ipfsUrl - The IPFS URL of the file to retrieve
     * @returns {Promise<{data: { buffer: Buffer, type: core.FileTypeResult }}>} Object containing file buffer and type information
     * @throws {Error} When file cannot be retrieved or processed
     * 
     * @description
     * Implementation should:
     * 1. Retrieve file content from IPFS
     * 2. Convert content to buffer
     * 3. Detect file type
     * 4. Return combined result
     */
    abstract getFile(
        ipfsUrl: string
    ): Promise<{data: { buffer: Buffer, type: core.FileTypeResult }}>;

    /**
     * Retrieves data from IPFS using a CID
     * Must be implemented by concrete provider classes
     * 
     * @abstract
     * @param {string} CID - The Content Identifier of the data to retrieve
     * @returns {Promise<{ data: any }>} The retrieved data
     * @throws {Error} When content cannot be retrieved
     * 
     * @description
     * Implementation should:
     * 1. Validate the CID
     * 2. Retrieve content from IPFS
     * 3. Process the content if needed
     * 4. Return the result
     */
    abstract get(
        CID: string
    ): Promise<{ data: any }>;
}