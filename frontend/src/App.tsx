import React, { useState, useEffect } from 'react';
import { createWalletClient, custom, publicActions, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { detectProviders } from './providers';
import type { EIP6963ProviderDetail } from './providers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID } from './contract';
import './App.css';

interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  message: string;
  hash?: string;
}

function App() {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EIP6963ProviderDetail | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [successCount, setSuccessCount] = useState<bigint>(0n);
  
  const [simpleStatus, setSimpleStatus] = useState<TransactionStatus>({ status: 'idle', message: '' });
  const [bugStatus, setBugStatus] = useState<TransactionStatus>({ status: 'idle', message: '' });
  const [countStatus, setCountStatus] = useState<TransactionStatus>({ status: 'idle', message: '' });

  useEffect(() => {
    detectProviders().then(setProviders);
  }, []);

  const connectWallet = async (providerDetail: EIP6963ProviderDetail) => {
    try {
      const { provider } = providerDetail;
      
      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check chain ID
      const currentChainId = await provider.request({ 
        method: 'eth_chainId' 
      }) as string;
      
      const chainIdNumber = parseInt(currentChainId, 16);
      
      if (chainIdNumber !== SEPOLIA_CHAIN_ID) {
        // Try to switch to Sepolia
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added, add it
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.infura.io/v3/a15aab43aea047459b33a31e6d967a17'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      setSelectedProvider(providerDetail);
      setAccount(accounts[0]);
      setChainId(SEPOLIA_CHAIN_ID);
      
      // Get balance
      await updateBalance(accounts[0], provider);
      
      // Get initial success count
      await updateSuccessCount(provider);
      
    } catch (error: any) {
      console.error('Connection failed:', error);
      alert(`Connection failed: ${error.message}`);
    }
  };

  const updateBalance = async (address: string, provider: any) => {
    try {
      const balanceHex = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }) as string;
      
      const balanceWei = BigInt(balanceHex);
      const balanceEth = formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const updateSuccessCount = async (provider: any) => {
    try {
      const client = createWalletClient({
        chain: sepolia,
        transport: custom(provider),
      }).extend(publicActions);

      const count = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getSuccessCount',
      }) as bigint;

      setSuccessCount(count);
    } catch (error) {
      console.error('Failed to get success count:', error);
    }
  };

  const executeTransaction = async (
    functionName: 'simpleSuccess' | 'catchRevertAndSucceed',
    setStatus: React.Dispatch<React.SetStateAction<TransactionStatus>>
  ) => {
    if (!selectedProvider || !account) {
      alert('Please connect your wallet first');
      return;
    }
  
    try {
      setStatus({ status: 'pending', message: `Executing ${functionName}()...` });
  
      const client = createWalletClient({
        chain: sepolia,
        transport: custom(selectedProvider.provider),
        account: account as `0x${string}`,
      }).extend(publicActions);
  
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: functionName,
      });
  
      setStatus({ 
        status: 'pending', 
        message: `Transaction submitted. Hash: ${hash}`,
        hash 
      });
  
      // Wait for transaction confirmation
      const receipt = await client.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        setStatus({ 
          status: 'success', 
          message: `✅ Success! Transaction confirmed.`,
          hash 
        });
        
        // Update success count and balance
        await updateSuccessCount(selectedProvider.provider);
        await updateBalance(account, selectedProvider.provider);
      } else {
        setStatus({ 
          status: 'error', 
          message: `❌ Transaction failed.`,
          hash 
        });
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      // Check if user rejected the transaction
      if (error.message?.includes('User rejected') || 
          error.message?.includes('user rejected') ||
          error.message?.includes('User denied') ||
          error.code === 4001) {
        setStatus({ 
          status: 'idle', 
          message: `Transaction cancelled by user.` 
        });
      } else {
        setStatus({ 
          status: 'error', 
          message: `❌ Error: ${error.message || 'Transaction failed'}` 
        });
      }
    }
  };

  const checkSuccessCount = async () => {
    if (!selectedProvider) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setCountStatus({ status: 'pending', message: 'Fetching success count...' });
      await updateSuccessCount(selectedProvider.provider);
      setCountStatus({ 
        status: 'success', 
        message: `📊 Current success count: ${successCount.toString()}` 
      });
    } catch (error: any) {
      setCountStatus({ 
        status: 'error', 
        message: `❌ Error: ${error.message}` 
      });
    }
  };

  const disconnect = () => {
    setSelectedProvider(null);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setSuccessCount(0n);
    setSimpleStatus({ status: 'idle', message: '' });
    setBugStatus({ status: 'idle', message: '' });
    setCountStatus({ status: 'idle', message: '' });
  };

  const StatusDisplay = ({ status }: { status: TransactionStatus }) => {
    if (status.status === 'idle') return null;
    
    const className = `status ${status.status}`;
    return (
      <div className={className}>
        {status.message}
        {status.hash && (
          <div>
            <a 
              href={`https://sepolia.etherscan.io/tx/${status.hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on Etherscan
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🦊 MetaMask Bug Test</h1>
        <p>Testing "This transaction is likely to fail" warning on successful transactions with internal reverts</p>
      </div>

      <div className="contract-info">
        <strong>Contract Address:</strong> {CONTRACT_ADDRESS}<br/>
        <strong>Network:</strong> Sepolia Testnet (Chain ID: {SEPOLIA_CHAIN_ID})<br/>
        <strong>Status:</strong> {account ? `Connected: ${account}` : 'Not Connected'}
        {account && (
          <>
            <br/><strong>Balance:</strong> {parseFloat(balance).toFixed(4)} ETH
            <br/><strong>Success Count:</strong> {successCount.toString()}
          </>
        )}
      </div>

      <div className="explanation">
        <h3>🎯 Test Objective</h3>
        <p>This test reproduces a MetaMask bug where transactions show "This transaction is likely to fail" warnings even when they ultimately succeed. The issue occurs when a smart contract function has an internal revert that gets caught and handled.</p>
      </div>

      {!account ? (
        <div className="button-section">
          <h3>🔗 Connect Wallet</h3>
          {providers.length === 0 ? (
            <p>No EIP-6963 compatible wallets found. Please install MetaMask or another compatible wallet.</p>
          ) : (
            providers.map((providerDetail) => (
              <button
                key={providerDetail.info.uuid}
                onClick={() => connectWallet(providerDetail)}
                className="test-button wallet-button"
              >
                <img src={providerDetail.info.icon} alt="" width="24" height="24" />
                Connect {providerDetail.info.name}
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="button-section">
            <h3>🔗 Connected</h3>
            <button onClick={disconnect} className="test-button disconnect-button">
              Disconnect Wallet
            </button>
          </div>

          <div className="button-section">
            <h3>✅ Control Test (Should work without warnings)</h3>
            <p>This function should execute normally without any warnings from MetaMask.</p>
            <button 
              onClick={() => executeTransaction('simpleSuccess', setSimpleStatus)}
              className="test-button"
              disabled={simpleStatus.status === 'pending'}
            >
              {simpleStatus.status === 'pending' ? 'Processing...' : 'Call simpleSuccess()'}
            </button>
            <StatusDisplay status={simpleStatus} />
          </div>

          <div className="button-section">
            <h3>⚠️ Bug Test (Should show "likely to fail" warning)</h3>
            <p>
              <strong>Expected behavior:</strong> MetaMask should show a 
              "This transaction is likely to fail" warning, but the transaction will succeed anyway.
            </p>
            <button 
              onClick={() => executeTransaction('catchRevertAndSucceed', setBugStatus)}
              className="test-button warning-button"
              disabled={bugStatus.status === 'pending'}
            >
              {bugStatus.status === 'pending' ? 'Processing...' : 'Call catchRevertAndSucceed() - BUG TEST'}
            </button>
            <StatusDisplay status={bugStatus} />
          </div>

          <div className="button-section">
            <h3>📊 Contract State</h3>
            <button 
              onClick={checkSuccessCount}
              className="test-button"
              disabled={countStatus.status === 'pending'}
            >
              {countStatus.status === 'pending' ? 'Checking...' : 'Refresh Success Count'}
            </button>
            <StatusDisplay status={countStatus} />
          </div>
        </>
      )}

      <div className="explanation">
        <h3>🔍 What to Look For</h3>
        <ul>
          <li><strong>Normal function:</strong> <code>simpleSuccess()</code> should execute without warnings</li>
          <li><strong>Bug reproduction:</strong> <code>catchRevertAndSucceed()</code> should show MetaMask warning but still succeed</li>
          <li><strong>Success verification:</strong> Both functions should increment the success counter</li>
        </ul>
      </div>
    </div>
  );
}

export default App;