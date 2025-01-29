/**
 * IPFS Module Entry Point
 * @module @hsuite/ipfs
 * 
 * @description
 * This module provides a complete IPFS integration solution for NestJS applications.
 * It includes services, controllers, and types for interacting with IPFS through
 * both direct node access and gateway access.
 * 
 * Key Features:
 * - IPFS node and gateway integration
 * - Content pinning and management
 * - File upload and retrieval
 * - Metadata processing
 * - MongoDB-based pin tracking
 * 
 * @example
 * ```typescript
 * import { IpfsModule } from '@hsuite/ipfs';
 * 
 * @Module({
 *   imports: [
 *     IpfsModule.forRootAsync({
 *       useFactory: (config) => ({
 *         nodeUrl: config.get('IPFS_NODE_URL'),
 *         gatewaysUrls: config.get('IPFS_GATEWAY_URLS'),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

export * from './ipfs.module';
export * from './ipfs.service';
export * from './ipfs.controller';
export * from './types';