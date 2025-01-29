# @hsuite/ipfs

A comprehensive NestJS module for interacting with IPFS (InterPlanetary File System) through both direct node access and HTTP gateways.

## Features

- 🚀 Direct IPFS node interaction
- 🌐 HTTP gateway support with fallback
- 📌 Content pinning management
- 📁 File upload and retrieval
- 🔍 Metadata processing
- 🗄️ MongoDB integration for pin persistence
- 🐳 Docker support for local IPFS node

## Installation

```bash
npm install @hsuite/ipfs
```

## Module Configuration

Import and configure the module in your NestJS application:

```typescript
import { IpfsModule } from '@hsuite/ipfs';

@Module({
  imports: [
    IpfsModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        nodeUrl: configService.get('IPFS_NODE_URL'),
        gatewaysUrls: configService.get('IPFS_GATEWAY_URLS'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## API Endpoints

The module exposes the following REST endpoints:

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| POST | `/ipfs/pin/:cid` | Pin content to IPFS | Pin operation result |
| DELETE | `/ipfs/unpin/:cid` | Unpin content from IPFS | Unpin operation result |
| GET | `/ipfs/:cid` | Read content from IPFS | Content data |
| GET | `/ipfs/file/:cid` | Get file from IPFS | File data and type |
| GET | `/ipfs/metadata/:cid` | Get metadata from IPFS | Processed metadata |
| POST | `/ipfs/upload` | Upload and pin file to IPFS | CID of pinned file |

## Service Usage

Inject the `IpfsService` into your components:

```typescript
import { IpfsService } from '@hsuite/ipfs';

@Injectable()
export class YourService {
  constructor(private readonly ipfsService: IpfsService) {}

  async pinContent(cid: string, owner: IAuth.ICredentials.IWeb3.IEntity) {
    return await this.ipfsService.pin(cid, owner);
  }

  async uploadFile(file: Express.Multer.File, session: IAuth.ICredentials.IWeb3.IEntity) {
    return await this.ipfsService.uploadAndPin(file, session);
  }
}
```

## Docker Support

The module includes Docker configuration for running a local IPFS node:

```bash
# Start IPFS node
docker-compose -f docker/docker-compose.yml up -d

# Stop IPFS node
docker-compose -f docker/docker-compose.yml down
```

Default ports:
- 4001: IPFS swarm
- 5001: IPFS API
- 8080: IPFS Gateway

## Architecture

The module is built with a layered architecture:

- **Controller Layer**: Handles HTTP requests and input validation
- **Service Layer**: Orchestrates operations between node and gateway providers
- **Provider Layer**: 
  - Node Provider: Direct IPFS network interaction
  - Gateway Provider: HTTP gateway access
- **Persistence Layer**: MongoDB integration for pin management

## Features in Detail

### Content Pinning

Manages content persistence on IPFS nodes:
- Pin content with owner tracking
- Unpin content with authorization
- Automatic pin record management

### File Handling

Comprehensive file operations:
- Upload with stream processing
- File type detection
- Size validation (default 100MB limit)
- Automatic pinning

### Metadata Processing

Advanced metadata handling:
- Automatic metadata extraction
- Image URL resolution
- Gateway URL generation

### High Availability

Built-in reliability features:
- Gateway fallback support
- Multiple gateway support
- Automatic retry mechanisms

## Requirements

- Node.js >= 14
- MongoDB >= 4.4
- IPFS node or gateway access
- Docker (optional, for local node)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Built with ❤️ by the HbarSuite Team<br>
  Copyright © 2024 HbarSuite. All rights reserved.
</p>