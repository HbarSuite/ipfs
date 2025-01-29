import { Inject, Injectable, Logger } from '@nestjs/common'
import { IPFS } from './types';
import core from 'file-type/core';
import { IAuth } from '@hsuite/auth-types';
import { Readable } from 'stream';
import { Multer } from 'multer';

type NewType = IAuth.ICredentials.IWeb3.IEntity;

/**
 * Service for interacting with IPFS through node and gateway providers
 * Provides a unified interface for IPFS operations including file handling,
 * content pinning, and metadata management.
 * 
 * @class IpfsService
 * @description
 * This service abstracts the complexity of IPFS operations by:
 * - Managing both node and gateway providers
 * - Handling file uploads and retrievals
 * - Managing content pinning
 * - Processing metadata
 */
@Injectable()
export class IpfsService {
  /** Logger instance for the IpfsService class */
  protected logger: Logger = new Logger(IpfsService.name);
  
  /** Map of IPFS providers (node and gateway) */
  private providers: Map<'node' | 'gateway', IPFS.Base>;

  /**
   * Creates an instance of IpfsService
   * @param {IPFS.Base[]} providers - Array of IPFS providers (node and gateway)
   * @throws {Error} When required providers are not available
   */
  constructor(
    @Inject('PROVIDERS') providers: IPFS.Base[]
  ) {
    this.providers = new Map(providers.map(provider => [provider.type, provider]));
  }

  /**
   * Retrieves content from IPFS by CID
   * Attempts retrieval through node first, falls back to gateway
   * 
   * @param {string} CID - Content identifier to retrieve
   * @returns {Promise<any>} Promise resolving to the retrieved content
   * @throws {Error} When content cannot be retrieved from any provider
   */
  async get(CID: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await (this.providers.get('node') as IPFS.Node).get(CID));
      } catch (error) {
        try {
          resolve(await (this.providers.get('gateway') as IPFS.Gateway).get(CID));
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * Retrieves a file from IPFS with its buffer and type information
   * Attempts retrieval through gateway first, falls back to node
   * 
   * @param {string} ipfsUrl - IPFS URL of the file to retrieve
   * @returns {Promise<{data: {buffer: Buffer, type: core.FileTypeResult}}>} Promise resolving to file data and type
   * @throws {Error} When file cannot be retrieved from any provider
   */
  async getFile(ipfsUrl: string): Promise<{ data: { buffer: Buffer, type: core.FileTypeResult } }> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(await (this.providers.get('gateway') as IPFS.Gateway).getFile(ipfsUrl));
      } catch (error) {
        try {
          resolve(await (this.providers.get('node') as IPFS.Node).getFile(ipfsUrl));
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * Pins content to IPFS using the node provider
   * Registers the pin in the database for tracking
   * 
   * @param {string} CID - Content identifier to pin
   * @param {IAuth.ICredentials.IWeb3.IEntity} owner - Entity owning the pinned content
   * @returns {Promise<any>} Promise resolving to pin operation result
   * @throws {Error} When pinning fails or node provider is unavailable
   */
  async pin(CID: string, owner: IAuth.ICredentials.IWeb3.IEntity): Promise<any> {
    return (this.providers.get('node') as IPFS.Node).pin(CID, owner);
  }

  /**
   * Unpins content from IPFS using the node provider
   * Removes the pin record from the database
   * 
   * @param {string} CID - Content identifier to unpin
   * @param {NewType} owner - Entity that owns the pinned content
   * @returns {Promise<any>} Promise resolving to unpin operation result
   * @throws {Error} When unpinning fails, content is not found, or user is unauthorized
   */
  async unpin(CID: string, owner: NewType): Promise<any> {
    return (this.providers.get('node') as IPFS.Node).unpin(CID, owner);
  }

  /**
   * Gets the status of the IPFS node
   * Retrieves information about node health, peers, and network status
   * 
   * @returns {Promise<any>} Promise resolving to node status information
   * @throws {Error} When node is unavailable or status cannot be retrieved
   */
  async getStatus(): Promise<any> {
    return (this.providers.get('node') as IPFS.Node).getStatus();
  }

  /**
   * Retrieves metadata for IPFS content
   * Processes and resolves image URLs in the metadata
   * 
   * @param {string} ipfsUrl - IPFS URL to get metadata for
   * @returns {Promise<any>} Promise resolving to content metadata
   * @throws {Error} When metadata cannot be retrieved or processed
   */
  async getMetadata(ipfsUrl: string): Promise<any> {
    return (this.providers.get('gateway') as IPFS.Gateway).getMetadata(ipfsUrl);
  }

  /**
   * Upload and pin a file to IPFS using streams
   * Handles file upload, pinning, and metadata registration
   * 
   * @param {Express.Multer.File} file - The file to upload
   * @param {IAuth.ISession} session - User session for authorization
   * @returns {Promise<string>} The CID of the uploaded and pinned file
   * @throws {Error} When upload fails or pinning is unsuccessful
   */
  async uploadAndPin(file: Multer.File, session: IAuth.ICredentials.IWeb3.IEntity): Promise<string> {
    const stream = Readable.from(file.buffer);
    
    // Use IPFS client's addAll to handle streams
    let lastResult;
    for await (const result of (this.providers.get('node') as IPFS.Node).client.addAll(stream, {
      progress: (prog) => console.log(`Upload progress: ${prog}`),
      pin: true
    })) {
      lastResult = result;
    }

    // Register the pin in our database
    await (this.providers.get('node') as IPFS.Node).getPinModel().create({
      cid: lastResult.cid.toString(),
      owner: session.walletId,
      timestamp: Date.now(),
      metadata: {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    });

    return lastResult.cid.toString();
  }
}
