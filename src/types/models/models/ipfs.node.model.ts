import { create as createIPFSClient, IPFSHTTPClient } from 'ipfs-http-client'
import { IIPFS } from "../../interfaces/ipfs.interface.namespace";
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { _Base } from './ipfs.base.model';
import core from 'file-type/core'
import { IAuth } from '@hsuite/auth-types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { _Pin, _PinDocument } from './ipfs.pin.model';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { LoggerHelper } from '@hsuite/helpers';

/**
 * Node implementation for IPFS access
 * Provides direct interaction with an IPFS node for content storage and retrieval
 * 
 * @class _Node
 * @extends {_Base}
 * @implements {IIPFS.INode}
 * @implements {OnModuleInit}
 * @description
 * This class provides:
 * - Direct IPFS node interaction via HTTP client
 * - Content pinning and unpinning
 * - File and data retrieval
 * - Node status monitoring
 * - Pin record management in MongoDB
 */
@Injectable()
export class _Node extends _Base implements IIPFS.INode, OnModuleInit {
    /**
     * Type identifier for node provider
     * Identifies this as a node-based IPFS provider
     * 
     * @type {'node'}
     * @description
     * Constant identifier that:
     * - Distinguishes node provider from gateway provider
     * - Used for provider-specific logic
     * - Enables type checking
     */
    type: 'node' = 'node';

    /**
     * Logger instance for the Node class
     * Provides structured logging for node operations
     * 
     * @type {LoggerHelper}
     * @description
     * Logger that:
     * - Records operational events
     * - Tracks errors and warnings
     * - Aids in debugging
     * - Follows NestJS logging patterns
     */
    private logger: LoggerHelper = new LoggerHelper(_Node.name);

    /**
     * IPFS HTTP client instance
     * Manages connection to IPFS node
     * 
     * @private
     * @type {IPFSHTTPClient}
     * @description
     * Client that:
     * - Handles IPFS protocol communication
     * - Manages node connection
     * - Provides IPFS operations API
     * - Maintains connection state
     */
    private _client: IPFSHTTPClient;

    /**
     * Creates an instance of _Node
     * Initializes the IPFS node provider
     * 
     * @param {Model<_PinDocument>} pinModel - Mongoose model for pin documents
     * @param {IIPFS.IOptions} options - IPFS configuration options
     * @param {HttpService} httpService - HTTP service for making requests
     * @description
     * Constructor that:
     * - Injects required dependencies
     * - Sets up pin model for database operations
     * - Configures node connection options
     * - Initializes HTTP service
     */
    constructor(
        @InjectModel(_Pin.name) private pinModel: Model<_PinDocument>,
        @Inject('ipfsOptions') private options: IIPFS.IOptions,
        private httpService: HttpService,
        private eventEmitter: EventEmitter2
    ) {
        super();
    }

    /**
     * Gets the pin model instance
     * Provides access to pin document operations
     * 
     * @returns {Model<_PinDocument>} The Mongoose pin model
     * @description
     * Accessor that:
     * - Returns pin model instance
     * - Enables pin CRUD operations
     * - Provides database access
     */
    getPinModel(): Model<_PinDocument> {
        return this.pinModel;
    }

    /**
     * Initializes the IPFS node connection
     * Sets up node client on module start
     * 
     * @returns {Promise<void>}
     * @description
     * Initialization that:
     * - Creates IPFS client
     * - Connects to IPFS daemon
     * - Verifies connection
     * - Logs connection status
     */
    async onModuleInit() {
        try {
            this._client = createIPFSClient({ url: this.options.nodeUrl });
            const version = await this.client.version();
            this.logger.log(`Connected to IPFS node version ${version.version}`);
        } catch (error) {
            this.logger.warn('Failed to connect to IPFS node. Running as resolver service only.');
            this.logger.verbose(`IPFS node error: ${error.message}`);
        }
    }

    /**
     * Gets the IPFS HTTP client instance
     * Provides access to configured client
     * 
     * @returns {IPFSHTTPClient} The IPFS HTTP client instance
     * @description
     * Getter that:
     * - Returns active client instance
     * - Enables direct client access
     * - Maintains encapsulation
     */
    get client(): IPFSHTTPClient {
        return this._client;
    }

    /**
     * Sets the IPFS HTTP client instance
     * Updates the active client connection
     * 
     * @param {IPFSHTTPClient} client - The IPFS HTTP client to set
     * @description
     * Setter that:
     * - Updates client instance
     * - Enables client reconfiguration
     * - Maintains single client instance
     */
    set client(client: IPFSHTTPClient) {
        this._client = client;
    }

    /**
     * Gets the status of the IPFS node
     * Retrieves node health and network information
     * 
     * @returns {Promise<any>} The node status information
     * @throws {Error} When status cannot be retrieved
     * @description
     * Status check that returns:
     * - Node ID and addresses
     * - Connected peers
     * - Network status
     * - Connection details
     */
    async getStatus(): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.options.nodeUrl}/id`, {})
            );

            const peers = await firstValueFrom(
                this.httpService.post(`${this.options.nodeUrl}/swarm/peers`, {})
            );

            return {
                id: response.data.ID,
                addresses: response.data.Addresses,
                peers: peers.data.Peers
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves data from IPFS using a CID
     * Fetches and parses IPFS content
     * 
     * @param {string} cid - The Content Identifier of the data to retrieve
     * @returns {Promise<{ data: any }>} The retrieved data
     * @throws {Error} When CID is invalid or content cannot be retrieved
     * @description
     * Retrieval process that:
     * - Validates CID
     * - Fetches content chunks
     * - Assembles complete data
     * - Parses JSON if possible
     */
    async get(cid: string): Promise<{ data: any }> {
        try {
            if (!cid) throw new Error('Invalid CID');
            const chunks = [];

            for await (const chunk of this.client.cat(cid, {
                timeout: 10000
            })) {
                chunks.push(chunk);
            }

            const content = Buffer.concat(chunks).toString();
            try {
                return { data: JSON.parse(content) };
            } catch {
                return { data: content };
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a file from IPFS and determines its type
     * Fetches binary content with type detection
     * 
     * @param {string} ipfsUrl - The IPFS URL of the file to retrieve
     * @returns {Promise<{data: { buffer: Buffer, type: core.FileTypeResult }}>} Object containing file buffer and type information
     * @throws {Error} When URL is invalid or file cannot be retrieved
     * @description
     * File retrieval that:
     * - Extracts CID from URL
     * - Fetches file content
     * - Detects file type
     * - Returns buffer and type info
     */
    async getFile(ipfsUrl: string): Promise<{ data: { buffer: Buffer, type: core.FileTypeResult } }> {
        try {
            const CID = this.extractCID(ipfsUrl);
            if (!CID) throw new Error('Invalid CID');

            const chunks = [];

            for await (const chunk of this.client.cat(CID, {
                timeout: 10000
            })) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);
            const { fileTypeFromBuffer } = await import('file-type');
            const type = await fileTypeFromBuffer(buffer);

            return { data: { buffer, type } };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Pins content to IPFS and registers the pin
     * Stores content and creates pin record
     * 
     * @param {string} content - The content to pin
     * @param {IAuth.ICredentials.IWeb3.IEntity} owner - The owner credentials
     * @param {boolean} broadcast - Whether to broadcast the pin
     * @returns {Promise<string>} The CID of the pinned content
     * @throws {Error} When content cannot be pinned or record cannot be created
     * @description
     * Pinning process that:
     * - Adds content to IPFS
     * - Creates pin database record
     * - Associates owner with content
     * - Optionally broadcasts update
     */
    async pin(content: string, owner: IAuth.ICredentials.IWeb3.IEntity, broadcast: boolean = true): Promise<string> {
        try {
            const result = await this.client.add(Buffer.from(content));
            const cid = result.cid.toString();

            const pin: _PinDocument = await this.pinModel.create({
                cid: cid,
                owner: owner.walletId,
                timestamp: Date.now()
            });

            if (broadcast) {
                this.eventEmitter.emit('ipfs:write', {
                    content: content,
                    owner: owner
                });
            }

            return cid;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handles IPFS broadcast write events
     * Pins content without broadcasting
     * 
     * @param {Object} payload - The IPFS write payload
     * @param {string} payload.content - The content to pin
     * @param {IAuth.ICredentials.IWeb3.IEntity} payload.owner - The owner credentials
     * @returns {Promise<boolean>} Whether the pin was successful
     * @throws {Error} When content cannot be pinned
     * @description
     * Pinning process that:
     * - Pins content without broadcasting
     * - Returns CID of pinned content  
     */
    @OnEvent('ipfs:broadcast:write')
    async handleIpfsBroadcastWrite(payload: {
        content: string,
        owner: IAuth.ICredentials.IWeb3.IEntity
    }) {
        try {
            await this.pin(payload.content, payload.owner, false);
        } catch(error) {
            return false;
        }
    }

    /**
     * Unpins content from IPFS if authorized
     * Removes pin and database record
     * 
     * @param {string} cid - The Content Identifier to unpin
     * @param {IAuth.ICredentials.IWeb3.IEntity} owner - The owner credentials
     * @returns {Promise<boolean>} Whether the unpin was successful
     * @throws {Error} When content not found, unauthorized, or cannot be unpinned
     * @description
     * Unpin process that:
     * - Verifies pin exists
     * - Checks owner authorization
     * - Removes IPFS pin
     * - Deletes pin record
     */
    async unpin(cid: string, owner: IAuth.ICredentials.IWeb3.IEntity): Promise<boolean> {
        try {
            const pinData = await this.pinModel.findOne({ cid });
            if (!pinData) {
                throw new Error('Content not pinned');
            }
            
            if (pinData.owner !== owner.walletId) {
                throw new Error('Unauthorized: only content owner can unpin');
            }

            await this.client.pin.rm(cid);
            await this.pinModel.deleteOne({ cid });
            return true;
        } catch (error) {
            throw error;
        }
    }
}