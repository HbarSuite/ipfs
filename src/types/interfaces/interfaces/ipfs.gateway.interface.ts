import { _IBase } from './ipfs.base.interface';

/**
 * Interface for IPFS Gateway provider
 * Defines HTTP gateway-specific functionality for IPFS access
 * 
 * @interface _IGateway
 * @description
 * This interface extends the base IPFS interface with methods specific to
 * HTTP gateway access. It provides functionality for:
 * - Image URL generation and optimization
 * - Metadata retrieval and processing
 * - Gateway-specific content access
 * 
 * @extends _IBase Base IPFS interface
 */
export interface _IGateway extends _IBase {
    /**
     * Type identifier for gateway provider
     * Constant value indicating gateway implementation
     * 
     * @type {'gateway'}
     * @description
     * Fixed type identifier used to distinguish gateway provider
     * from other IPFS provider implementations
     */
    type: 'gateway';

    /**
     * Generates a URL for retrieving an image from IPFS via gateway
     * Creates an optimized image URL with gateway-specific parameters
     * 
     * @param {string} cid - The Content Identifier of the image
     * @returns {string} The formatted gateway URL for the image
     * @throws {Error} When CID is invalid or URL generation fails
     * 
     * @example
     * Returns URL in format: https://gateway.example.com/ipfs/{CID}?optimizer=image
     */
    getImageUrl(cid: string): string;

    /**
     * Retrieves and processes metadata from IPFS
     * Handles base64 decoding and image URL resolution
     * 
     * @param {string} ipfsUrl - Base64 encoded IPFS URL containing metadata
     * @returns {Promise<any>} The processed metadata with resolved image URLs
     * @throws {Error} When metadata cannot be retrieved or processed
     * 
     * @description
     * This method:
     * 1. Decodes the base64 IPFS URL
     * 2. Retrieves the metadata content
     * 3. Processes any image URLs in the metadata
     * 4. Returns the processed metadata object
     */
    getMetadata(ipfsUrl: string): Promise<any>;
}