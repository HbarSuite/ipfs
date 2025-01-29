import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IIPFS } from '../../interfaces/ipfs.interface.namespace';

/**
 * Type definition for Pin document that extends both _Pin class and Document
 * Combines Mongoose document features with Pin model
 * 
 * @type {_PinDocument}
 * @description
 * This type combines:
 * - Pin model properties
 * - Mongoose document methods
 * - Timestamp fields
 * - Document lifecycle hooks
 */
export type _PinDocument = _Pin & Document;

/**
 * Schema class for IPFS Pin documents
 * Defines the MongoDB schema for pin records
 * 
 * @class _Pin
 * @implements {IIPFS.IPin}
 * @description
 * This class defines the MongoDB schema for IPFS pin records.
 * It includes:
 * - Required fields validation
 * - Type definitions
 * - Automatic timestamps
 * - Index configurations
 */
@Schema({ timestamps: true })
export class _Pin implements IIPFS.IPin {
    /**
     * Content Identifier (CID) of the pinned IPFS content
     * Unique identifier for the pinned content
     * 
     * @type {string}
     * @description
     * Required field that:
     * - Must be a valid IPFS CID
     * - Is used as the primary identifier
     * - Should be unique in the collection
     */
    @Prop({ required: true })
    cid: string;

    /**
     * Address/identifier of the content owner
     * Links pin record to content owner
     * 
     * @type {string}
     * @description
     * Required field that:
     * - Stores the owner's wallet address
     * - Used for access control
     * - Enables ownership verification
     */
    @Prop({ required: true, type: String })
    owner: string;

    /**
     * Timestamp when the content was pinned
     * Records the pin operation time
     * 
     * @type {number}
     * @description
     * Required field that:
     * - Stores Unix timestamp in milliseconds
     * - Used for chronological tracking
     * - Enables time-based queries
     */
    @Prop({ required: true })
    timestamp: number;
}

/**
 * Mongoose schema for Pin documents
 * Factory-created schema from Pin class
 * 
 * @description
 * This schema:
 * - Is created from the _Pin class
 * - Includes automatic timestamps
 * - Can be extended with indexes
 * - Supports Mongoose middleware
 * 
 * @example
 * ```typescript
 * // Using the schema in a module
 * MongooseModule.forFeature([
 *   { name: IPFS.Pin.name, schema: _PinSchema }
 * ])
 * ```
 */
export const _PinSchema = SchemaFactory.createForClass(_Pin);