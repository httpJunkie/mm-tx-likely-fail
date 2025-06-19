# MetaMask "Transaction Likely to Fail" Warning Bug Test Dapp

A demonstration dapp that reproduces a MetaMask bug where transactions are incorrectly flagged as "likely to fail" even when they will succeed.

## The Bug
MetaMask shows a "This transaction is likely to fail" warning for transactions that call Solidity functions using try-catch blocks to handle reverts, even when the transaction will ultimately succeed.

## Test Contract
- `simpleSuccess()` - Normal function that succeeds (no warning)
- `catchRevertAndSucceed()` - Uses try-catch to handle a revert and succeed (triggers false warning)

## Tech Stack
- **Frontend**: React + TypeScript + Viem + Wagmi
- **Blockchain**: Ethereum Sepolia testnet
- **Smart Contract**: Solidity with Foundry

## Quick Start
1. Clone and install: `npm install`
2. Deploy contract: `forge create src/MetaMaskBugTest.sol:MetaMaskBugTest --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast`
3. Update contract address in `frontend/src/contract.ts`
4. Run frontend: `cd frontend && npm run dev`
5. Connect MetaMask and test both functions

## Foundry

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Docs

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
