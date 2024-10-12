# Unique Network React Boilerplate

This boilerplate aims to simplify working with Unique Network and Unique SDK.

```sh
yarn
yarn start
```

> [!IMPORTANT]
> There are specific versions of this template:
> - For the EVM workshop, use https://github.com/UniqueNetwork/unique-react-template/tree/workshop-evm
> - For the legacy version of Unique SDK-1.0, use https://github.com/UniqueNetwork/unique-react-template/tree/sdk-1


### Connect to Unique SDK

This boilerplate utilizes `@unique-nft/sdk` which allows an easy and efficient way to interact with substrate-based networks. Read more about SDK in [documentation](https://docs.unique.network/build/sdk/getting-started.html)

Learn how to:

- Connect to Unique Network using Unique SDK: [`src/sdk/SdkContext.tsx`](./src/sdk/SdkContext.tsx)
- Initialize and access UniqueChain and UniqueScan instances: [`src/hooks/useChainAndScan.ts`](./src/hooks/useChainAndScan.ts)

### Work with accounts and wallets

This boilerplate supports Polkadot wallets such as `Polkadot{.js}`, `Talisman`, `SubWallet`, `Enkrypt`.

EVM wallets supports by `WalletConnect`.

Read more about working with accounts in [documentation](https://docs.unique.network/tutorials/work-with-accounts.html) 

Learn how to:

- Integrate with Polkadot wallets: [`/src/accounts/PolkadotWallet.ts`](./src/accounts/PolkadotWallet.ts). This file handles the integration with various Polkadot-based wallets. It is responsible for loading wallet accounts, normalizing addresses, and managing account-related operations specific to the Polkadot ecosystem.
- Integrate with EVM wallets via WalletConnect: [`/src/components/WalletConnectProviders.tsx`](./src/components/WalletConnectProviders.tsx) This file contains all the logic related to connecting and managing EVM wallets using WalletConnect, providing a convenient and modular structure for handling connections and interactions with Ethereum wallets.
- Manage multiple wallet connections and interactions: [`src/accounts/useWalletCenter.tsx`](./src/accounts/useWalletCenter.tsx). This custom React hook is designed to manage the connection and state of multiple blockchain wallets, including Polkadot and Ethereum wallets. It provides functionality for connecting to wallets, storing connected wallets in local storage, and updating the state of connected accounts.
- Centralize account management and state: [`src/accounts/AccountsContext.tsx`](./src/accounts/AccountsContext.tsx). This file sets up a React context for managing blockchain accounts, including both Polkadot and Ethereum wallets. It provides a unified interface for interacting with accounts, updating balances, and handling account selection across the application.

### Make transactions

Read how to create collections and tokens in [Unique Docs](https://docs.unique.network/build/sdk/v2/balances.html)

Learn how to:

- transfer native tokens: [`src/modals/TransferAmountModal.tsx`](./src/modals/TransferAmountModal.tsx)
- transfer NFTs: [`src/modals/TransferNFTModal.tsx`](./src/modals/TransferNFTModal.tsx)
- Nest tokens: [`src/modals/NestModal.tsx`](./src/modals/NestModal.tsx). Read more about [nesting](https://docs.unique.network/build/sdk/v2/tokens.html#nesting)
- burn tokens: [`src/modals/BurnModal.tsx`](./src/modals/BurnModal.tsx)
