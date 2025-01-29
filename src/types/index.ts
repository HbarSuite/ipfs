/**
 * @module Types
 * @description
 * This module exports all IPFS-related type definitions including interfaces and models.
 * It serves as the main entry point for all type definitions used throughout the IPFS package.
 * 
 * @packageDocumentation
 * @module @hsuite/ipfs/types
 * 
 * @preferred
 * 
 * @remarks
 * The types module provides two main namespaces:
 * - IIPFS: Contains interface definitions for IPFS functionality including INode, IGateway, and IOptions
 * - IPFS: Contains concrete model implementations of the interfaces
 * 
 * @example
 * ```typescript
 * import { IPFS, IIPFS } from '@hsuite/ipfs';
 * 
 * // Use interfaces for type definitions
 * const nodeConfig: IIPFS.IOptions = {
 *   gatewaysUrls: ['https://ipfs.io/ipfs/']
 * };
 * 
 * // Use concrete classes for implementation
 * const node = new IPFS.Node(nodeConfig);
 * const gateway = new IPFS.Gateway(nodeConfig);
 * ```
 * 
 * @see {@link IIPFS} For interface definitions
 * @see {@link IPFS} For concrete implementations
 * 
 * @public
 */

export * from './interfaces/ipfs.interface.namespace';
export * from './models/ipfs.models.namespace';