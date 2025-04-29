import { Controller, Post, Delete, Get, Param, Request, BadRequestException, UseInterceptors, UploadedFile, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

/**
 * Controller handling IPFS operations including pinning, unpinning and reading content
 * 
 * @class IpfsController
 * @description
 * Provides HTTP endpoints for interacting with IPFS content through the IpfsService.
 * Handles file uploads, content pinning/unpinning, and content retrieval operations.
 * 
 * @remarks
 * This controller exposes the following endpoints:
 * - POST /pin/{cid} - Pin content to IPFS
 * - DELETE /unpin/{cid} - Unpin content from IPFS
 * - GET /{cid} - Read content from IPFS
 * - GET /file/{cid} - Get file from IPFS
 * - GET /metadata/{cid} - Get metadata from IPFS
 * - POST /upload - Upload and pin file to IPFS
 * 
 * All operations require authentication unless marked @Public
 */
@ApiTags('IPFS')
@Controller('ipfs')
export class IpfsController {
  /**
   * Creates an instance of IpfsController
   * @param {IpfsService} ipfsService - Service for handling IPFS operations
   */
  constructor(private readonly ipfsService: IpfsService) {}

  /**
   * Pin content to IPFS
   * Registers the content in the pinning service for persistence
   * 
   * @param {string} cid - Content Identifier to pin
   * @param {Request} request - HTTP request containing user session
   * @returns {Promise<any>} Promise resolving to pin operation result
   * @throws {BadRequestException} When pinning fails or CID is invalid
   */
  @Post('pin/:cid')
  @ApiOperation({ summary: 'IPFS.Pin.Content' })
  @ApiResponse({ status: 200, description: 'IPFS.Pin.Content.Success' })
  @ApiResponse({ status: 400, description: 'IPFS.Pin.Content.Error.InvalidInput' })
  @ApiResponse({ status: 401, description: 'IPFS.Pin.Content.Error.Unauthorized' })
  async pinContent(
    @Param('cid') cid: string,
    @Request() request
  ) {
    try {
      return await this.ipfsService.pin(cid, request.user.session);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Unpin content from IPFS
   * Removes the content from the pinning service
   * 
   * @param {string} cid - Content Identifier to unpin
   * @param {Request} request - HTTP request containing user session
   * @returns {Promise<any>} Promise resolving to unpin operation result
   * @throws {BadRequestException} When unpinning fails, CID is invalid, or user is unauthorized
   */
  @Delete('unpin/:cid')
  @ApiOperation({ summary: 'IPFS.Unpin.Content' })
  @ApiResponse({ status: 200, description: 'IPFS.Unpin.Content.Success' })
  @ApiResponse({ status: 400, description: 'IPFS.Unpin.Content.Error.InvalidInput' })
  @ApiResponse({ status: 401, description: 'IPFS.Unpin.Content.Error.Unauthorized' })
  @ApiResponse({ status: 403, description: 'IPFS.Unpin.Content.Error.Forbidden' })
  async unpinContent(
    @Param('cid') cid: string,
    @Request() request
  ) {
    try {
      return await this.ipfsService.unpin(cid, request.user.session);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Read content from IPFS
   * Retrieves and returns the content data
   * 
   * @param {string} cid - Content Identifier to read
   * @returns {Promise<any>} Promise resolving to the content data
   * @throws {BadRequestException} When content cannot be retrieved or CID is invalid
   */
  @Get(':cid')
  @ApiOperation({ summary: 'IPFS.Read.Content' })
  @ApiResponse({ status: 200, description: 'IPFS.Read.Content.Success' })
  @ApiResponse({ status: 400, description: 'IPFS.Read.Content.Error.InvalidInput' })
  @ApiResponse({ status: 404, description: 'IPFS.Read.Content.Error.NotFound' })
  async readContent(@Param('cid') cid: string) {
    try {
      return (await this.ipfsService.get(cid)).data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get file from IPFS
   * Retrieves file data and type information
   * 
   * @param {string} cid - Content Identifier to get file from
   * @returns {Promise<any>} Promise resolving to the file data and type
   * @throws {BadRequestException} When file cannot be retrieved or CID is invalid
   */
  @Get('file/:cid')
  @ApiOperation({ summary: 'IPFS.Get.File' })
  @ApiResponse({ status: 200, description: 'IPFS.Get.File.Success' })
  @ApiResponse({ status: 400, description: 'IPFS.Get.File.Error.InvalidInput' })
  @ApiResponse({ status: 404, description: 'IPFS.Get.File.Error.NotFound' })
  async getFile(@Param('cid') cid: string) {
    try {
      return await this.ipfsService.getFile(cid);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get metadata from IPFS
   * Retrieves and processes content metadata
   * 
   * @param {string} cid - Content Identifier to get metadata from
   * @returns {Promise<any>} Promise resolving to the processed metadata
   * @throws {BadRequestException} When metadata cannot be retrieved or CID is invalid
   */
  @Get('metadata/:cid')
  @ApiOperation({ summary: 'IPFS.Get.Metadata' })
  @ApiResponse({ status: 200, description: 'IPFS.Get.Metadata.Success' })
  @ApiResponse({ status: 400, description: 'IPFS.Get.Metadata.Error.InvalidInput' })
  @ApiResponse({ status: 404, description: 'IPFS.Get.Metadata.Error.NotFound' })
  async getMetadata(@Param('cid') cid: string) {
    try {
      return await this.ipfsService.getMetadata(cid);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Upload and pin a file to IPFS
   * Handles multipart file upload, pins the content, and registers metadata
   * 
   * @param {Express.Multer.File} file - The file to upload and pin
   * @param {Request} request - HTTP request containing user session
   * @returns {Promise<string>} Promise resolving to the CID of the pinned file
   * @throws {BadRequestException} When upload fails or file is invalid
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'IPFS.Upload.File' })
  @ApiResponse({ status: 201, description: 'IPFS.Upload.File.Success' })
  @ApiResponse({ status: 400, description: 'IPFS.Upload.File.Error.InvalidInput' })
  @ApiResponse({ status: 401, description: 'IPFS.Upload.File.Error.Unauthorized' })
  @ApiBody({ 
    type: () => Object,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 100MB)',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }) // 100MB limit example
        ],
      }),
    ) 
    file: Multer.File,
    @Request() request
  ) {
    try {
      return await this.ipfsService.uploadAndPin(file, request.user.session);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}