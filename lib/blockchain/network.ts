"use client";
/**
 * Local Hardhat network configuration for CareProof.
 * These are development-only credentials — publicly known Hardhat accounts.
 * Never use these on a production or mainnet network.
 */
import { type Chain } from "viem";

export const careproofLocal: Chain = {
  id: 31337,
  name: "CareProof Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public:  { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: undefined,
  testnet: true,
};

/** EIP-3085 wallet_addEthereumChain params */
export const addNetworkParams = {
  chainId:           "0x7A69", // 31337 in hex
  chainName:         "CareProof Local",
  nativeCurrency:    { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls:           ["http://127.0.0.1:8545"],
  blockExplorerUrls: null,
};

export const SUPPORTED_CHAIN_ID = 31337;

/** Returns true when the connected chain matches the required network */
export function isSupportedChain(chainId: number | undefined): boolean {
  return chainId === SUPPORTED_CHAIN_ID;
}
