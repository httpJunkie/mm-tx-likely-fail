// src/contract.ts
export const CONTRACT_ADDRESS = '0x0FB96262E2f2592deC70919373F738091E9E19F5' as const;

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'catchRevertAndSucceed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'simpleSuccess',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSuccessCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'successCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'message', type: 'string' },
      { indexed: false, internalType: 'address', name: 'caller', type: 'address' },
    ],
    name: 'TransactionSucceeded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'string', name: 'reason', type: 'string' },
    ],
    name: 'InternalCallFailed',
    type: 'event',
  },
] as const;

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/a15aab43aea047459b33a31e6d967a17';