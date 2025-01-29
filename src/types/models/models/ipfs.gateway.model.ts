import { Inject, Injectable } from "@nestjs/common";
import { IIPFS } from "../../interfaces/ipfs.interface.namespace";
import { HttpService } from "@nestjs/axios";
import core from 'file-type/core';
import { _Base } from "./ipfs.base.model";

/**
 * Gateway implementation for IPFS access
 * Provides functionality to interact with IPFS through public gateways
 * 
 * @class _Gateway
 * @extends {_Base}
 * @implements {IIPFS.IGateway}
 * @description
 * This class provides:
 * - Content retrieval through public IPFS gateways
 * - File type detection and processing
 * - Metadata handling and resolution
 * - Image URL optimization
 * - Fallback gateway support
 */
@Injectable()
export class _Gateway extends _Base implements IIPFS.IGateway {
    /**
     * Type identifier for gateway provider
     * Identifies this as a gateway-based IPFS provider
     * 
     * @type {'gateway'}
     * @description
     * Constant identifier that:
     * - Distinguishes gateway provider from node provider
     * - Used for provider-specific logic
     * - Enables type checking
     */
    type: 'gateway' = 'gateway';

    /**
     * Creates an instance of _Gateway
     * Initializes the gateway provider with required dependencies
     * 
     * @param {IIPFS.IOptions} options - Configuration options including gateway URLs
     * @param {HttpService} httpService - The HTTP service for making gateway requests
     * @description
     * Constructor that:
     * - Injects configuration options
     * - Sets up HTTP service for requests
     * - Initializes base class
     */
    constructor(
        @Inject('ipfsOptions') private options: IIPFS.IOptions,
        private httpService: HttpService
    ) {
        super();
    }

    /**
     * Retrieves data from IPFS using a CID by trying multiple gateways
     * Attempts retrieval from each configured gateway until successful
     * 
     * @param {string} CID - The Content Identifier of the data to retrieve
     * @returns {Promise<any>} The retrieved data
     * @throws {Error} When content cannot be retrieved from any gateway
     * @description
     * This method:
     * - Tries all configured gateways
     * - Uses Promise.any for fastest response
     * - Returns first successful response
     * - Handles gateway failures gracefully
     */
    async get(CID: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let promises = [];

                this.options.gatewaysUrls.forEach((gateway) => {
                    promises.push(this.httpService.get(`${gateway}${CID}`).toPromise());
                });

                let response = await Promise.any(promises);
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves a file from IPFS and determines its type
     * Downloads file content and performs type detection
     * 
     * @param {string} ipfsUrl - The IPFS URL of the file to retrieve
     * @returns {Promise<{data: { buffer: Buffer, type: core.FileTypeResult }}>} Object containing file buffer and type information
     * @throws {Error} When file cannot be retrieved or processed
     * @description
     * This method:
     * - Extracts CID from URL
     * - Retrieves file from gateways
     * - Detects file type
     * - Returns buffer and type info
     */
    async getFile(ipfsUrl: string): Promise<{ data: { buffer: Buffer, type: core.FileTypeResult } }> {
        return new Promise(async (resolve, reject) => {
            try {
                let CID = this.extractCID(ipfsUrl);

                let promises = [];

                this.options.gatewaysUrls.forEach((gateway) => {
                    promises.push(this.httpService.get(`${gateway}${CID}`, { responseType: 'arraybuffer' }).toPromise());
                });

                let response = await Promise.any(promises);
                let buffer = response.data;

                const { fileTypeFromBuffer } = await import('file-type');
                const type = await fileTypeFromBuffer(buffer);

                resolve({
                    data: {
                        buffer: buffer,
                        type: type
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves and processes metadata from IPFS
     * Decodes base64 IPFS URL, retrieves metadata and resolves image URLs
     * 
     * @param {string} ipfsUrl - Base64 encoded IPFS URL containing metadata
     * @returns {Promise<any>} The processed metadata with resolved image URLs
     * @throws {Error} When metadata cannot be retrieved or processed
     * @description
     * This method:
     * - Decodes base64 URL
     * - Extracts CID
     * - Retrieves metadata
     * - Resolves image URLs
     * - Returns processed metadata
     */
    async getMetadata(ipfsUrl: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                ipfsUrl = Buffer.from(ipfsUrl, 'base64').toString();
                let CID = this.extractCID(ipfsUrl);

                let metadata = await this.get(CID);
                let image = this.extractCID(metadata.image ? metadata.image : metadata.CID);

                metadata.image = this.getImageUrl(image);
                resolve(metadata);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generates a URL for retrieving an image from IPFS via Pinata gateway
     * Includes optimization parameters for the image
     * 
     * @param {string} cid - The Content Identifier of the image
     * @returns {string} The formatted gateway URL for the image
     * @description
     * This method:
     * - Formats Pinata gateway URL
     * - Adds image optimization params
     * - Encodes CID properly
     * - Sets standard image width
     */
    getImageUrl(cid: string): string {
        return `https://gateway.pinata.cloud/ipfs/${encodeURIComponent(cid)}?optimizer=image&width=300`;
    }
}