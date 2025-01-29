/**
 * Main module for IPFS functionality
 * Configures and provides IPFS services and dependencies
 * 
 * @module IpfsModule
 * @description
 * This module provides a complete IPFS integration solution by configuring:
 * - HTTP client for making requests to IPFS nodes and gateways
 * - MongoDB integration for pin management and persistence
 * - IPFS Node provider for direct IPFS network access
 * - IPFS Gateway provider for HTTP gateway access
 * - IpfsService for high-level IPFS operations
 * 
 * @example
 * ```typescript
 * // Import and configure the module
 * @Module({
 *   imports: [
 *     IpfsModule.forRootAsync({
 *       useFactory: (configService: ConfigService) => ({
 *         nodeUrl: configService.get('IPFS_NODE_URL'),
 *         gatewaysUrls: configService.get('IPFS_GATEWAY_URLS'),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { HttpModule, HttpService } from '@nestjs/axios'
import { DynamicModule, Module } from '@nestjs/common'
import { IpfsService } from './ipfs.service'
import { IpfsController } from './ipfs.controller'
import { IPFS } from './types/models/ipfs.models.namespace';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IIPFS } from './types';

@Module({})
export class IpfsModule {
  /**
   * Asynchronously configures and initializes the IPFS module
   * 
   * @param {any} options - Configuration options for IPFS providers
   * @returns {Promise<DynamicModule>} Promise resolving to the configured module
   * 
   * @description
   * This method sets up:
   * - HTTP client for IPFS communication
   * - MongoDB models for pin management
   * - IPFS Node and Gateway providers
   * - IpfsService and Controller
   * 
   * The module is configured globally and exports providers for use in other modules.
   */
  static async forRootAsync(options: any): Promise<DynamicModule> {
    return {
      module: IpfsModule,
      imports: [
        HttpModule.register({}),
        MongooseModule.forFeature([
          { name: IPFS.Pin.name, schema: IPFS.PinSchema }
        ])
      ],
      controllers: options.includeController ? 
        [IpfsController] : 
        [],
      providers: [
        IpfsService,
        {
          provide: 'IPFS_NODE',
          useFactory: (
            httpService: HttpService, 
            pinModel: Model<IPFS.PinDocument>, 
            options: IIPFS.IOptions
          ) => new IPFS.Node(pinModel, options, httpService),
          inject: [HttpService, getModelToken(IPFS.Pin.name), 'ipfsOptions'],
        },
        {
          provide: 'IPFS_GATEWAY', 
          useFactory: (
            httpService: HttpService, 
            options: IIPFS.IOptions
          ) => new IPFS.Gateway(options, httpService),
          inject: [HttpService, 'ipfsOptions'],
        },
        {
          provide: 'PROVIDERS',
          useFactory: (node: IPFS.Node, gateway: IPFS.Gateway) => [node, gateway],
          inject: ['IPFS_NODE', 'IPFS_GATEWAY'],
        },
        {
          provide: 'ipfsOptions',
          useFactory: options.useFactory,
          inject: options.useExisting
        }
      ],
      exports: [
        IpfsService,
        'IPFS_NODE', 
        'IPFS_GATEWAY'
      ],
      global: true
    }
  }
}
