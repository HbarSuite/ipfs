import { _IBase } from "./interfaces/ipfs.base.interface";
import { _IGateway } from "./interfaces/ipfs.gateway.interface";
import { _INode } from "./interfaces/ipfs.node.interface";
import { _IOptions } from "./interfaces/ipfs.options.interface";
import { _IPin } from "./interfaces/ipfs.pin.interface";

/**
 * IPFS Interface Namespace
 * Contains type definitions for IPFS functionality
 * 
 * @namespace IIPFS
 * @description
 * This namespace provides interface types for the IPFS module components.
 * It includes interfaces for:
 * - Node operations (direct IPFS node access)
 * - Gateway operations (HTTP gateway access)
 * - Base IPFS functionality
 * - Pin management
 * - Configuration options
 * 
 * @package @hsuite/ipfs
 */
export namespace IIPFS {
    /**
     * Interface type for IPFS Node functionality
     * Defines methods for direct IPFS node operations
     * 
     * @type {INode}
     * @description
     * Provides methods for:
     * - Content pinning and unpinning
     * - Node status retrieval
     * - Direct IPFS client access
     * 
     * @extends _INode
     * @see {@link _INode}
     */
    export type INode = _INode;

    /**
     * Interface type for IPFS Gateway functionality
     * Defines methods for HTTP gateway operations
     * 
     * @type {IGateway}
     * @description
     * Provides methods for:
     * - Content retrieval through gateways
     * - Image URL generation
     * - Metadata processing
     * 
     * @extends _IGateway 
     * @see {@link _IGateway}
     */
    export type IGateway = _IGateway;

    /**
     * Interface type for IPFS Base functionality
     * Defines common methods shared between Node and Gateway
     * 
     * @type {IBase}
     * @description
     * Provides common methods for:
     * - CID extraction
     * - File retrieval
     * - Content access
     * 
     * @extends _IBase
     * @see {@link _IBase}
     */
    export type IBase = _IBase;

    /**
     * Interface type for IPFS Pin functionality
     * Defines structure for pin records
     * 
     * @type {IPin}
     * @description
     * Defines properties for:
     * - Content identifier (CID)
     * - Owner information
     * - Timestamp data
     * 
     * @extends _IPin
     * @see {@link _IPin}
     */
    export type IPin = _IPin;

    /**
     * Interface type for IPFS Options functionality
     * Defines configuration options for IPFS services
     * 
     * @type {IOptions}
     * @description
     * Defines configuration for:
     * - Gateway URLs
     * - Node URL
     * - Service options
     * 
     * @extends _IOptions
     * @see {@link _IOptions}
     */
    export type IOptions = _IOptions;
}