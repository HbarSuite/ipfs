/**
 * Interface defining configuration options for IPFS service
 * Specifies required URLs for IPFS node and gateway access
 * 
 * @interface _IOptions
 * @description
 * This interface defines the configuration options required for:
 * - IPFS node connection setup
 * - Gateway access configuration
 * - Service initialization
 * 
 * The options are typically provided during module initialization
 * through the forRootAsync() method.
 */
export interface _IOptions {
    /**
     * Array of IPFS gateway URLs to use for retrieving content
     * Provides fallback options for content retrieval
     * 
     * @type {string[]}
     * @description
     * List of public or private IPFS gateway URLs.
     * Multiple gateways provide:
     * - Redundancy for content retrieval
     * - Load balancing capabilities
     * - Fallback options on failure
     * 
     * @example
     * ['https://ipfs.io/ipfs/', 'https://gateway.pinata.cloud/ipfs/']
     */
    gatewaysUrls: string[]

    /**
     * URL of the IPFS node to connect to
     * Specifies the IPFS daemon endpoint
     * 
     * @type {string}
     * @description
     * URL of the IPFS node (daemon) to connect to.
     * This can be:
     * - Local node (e.g., http://localhost:5001)
     * - Remote node
     * - Infura IPFS node
     * - Other IPFS service provider
     * 
     * @example
     * 'http://localhost:5001'
     */
    nodeUrl: string
}