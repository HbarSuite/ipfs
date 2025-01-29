import { _Base } from "./models/ipfs.base.model";
import { _Gateway } from "./models/ipfs.gateway.model";
import { _Node } from "./models/ipfs.node.model";
import { _Pin, _PinDocument, _PinSchema } from "./models/ipfs.pin.model";

/**
 * IPFS Models Namespace
 * Contains model implementations for IPFS functionality
 * 
 * @namespace IPFS
 * @description
 * This namespace provides concrete implementations of IPFS functionality.
 * It includes classes for:
 * - Node operations (direct IPFS node access)
 * - Gateway operations (HTTP gateway access)
 * - Base IPFS functionality
 * - Pin management and persistence
 * 
 * @package @hsuite/ipfs
 */
export namespace IPFS {
    /**
     * Node class for direct IPFS network interaction
     * Implements core IPFS node functionality
     * 
     * @class Node
     * @description
     * Provides implementation for:
     * - Content pinning and unpinning
     * - Node status monitoring
     * - Direct IPFS client operations
     * - Pin management with MongoDB
     * 
     * @extends {_Node} Base Node implementation
     */
    export class Node extends _Node {}

    /**
     * Gateway class for HTTP-based IPFS access
     * Implements gateway-specific functionality
     * 
     * @class Gateway
     * @description
     * Provides implementation for:
     * - Content retrieval through HTTP gateways
     * - Image URL generation and processing
     * - Metadata handling and resolution
     * - Fallback gateway support
     * 
     * @extends {_Gateway} Base Gateway implementation
     */
    export class Gateway extends _Gateway {}

    /**
     * Abstract base class for IPFS operations
     * Implements shared functionality
     * 
     * @class Base
     * @description
     * Provides common implementation for:
     * - CID extraction and validation
     * - File type detection
     * - Content retrieval
     * - Error handling
     * 
     * @extends {_Base} Base implementation
     * @abstract
     */
    export abstract class Base extends _Base {}

    /**
     * Pin class for managing IPFS content pins
     * Implements pin record functionality
     * 
     * @class Pin
     * @description
     * Provides implementation for:
     * - Pin record structure
     * - MongoDB schema integration
     * - Pin metadata management
     * - Owner tracking
     * 
     * @extends {_Pin} Base Pin implementation
     */
    export class Pin extends _Pin {}

    /**
     * Type definition for IPFS pin document
     * Defines MongoDB document structure
     * 
     * @type {PinDocument}
     * @description
     * Extends Pin class with MongoDB document features:
     * - Mongoose document methods
     * - Timestamps
     * - Schema validation
     * 
     * @typedef {_PinDocument} PinDocument
     */
    export type PinDocument = _PinDocument;

    /**
     * Mongoose schema for IPFS pin records
     * Defines database structure
     * 
     * @const {PinSchema}
     * @description
     * Provides MongoDB schema with:
     * - Required fields validation
     * - Automatic timestamps
     * - Index definitions
     * - Type safety
     * 
     * @type {_PinSchema}
     */
    export const PinSchema = _PinSchema;
}