# Unique Network React Boilerplate

This boilerplate aims to simplify working with Unique Network and Unique SDK.

> [!TIP]
> Unique SDK-2.0-alpha released. If you want to try it out proceed to https://github.com/UniqueNetwork/accounts-react-example/tree/sdk-2

```sh
npm install
npm run start
```

## Unique Network SDK

This boilerplate utilizes `@unique-nft/sdk` which allows an easy and efficient way to interact with substrate-based networks.

Learn how to:
- connect to SDK: [`src/sdk/SdkContext.tsx`](./src/sdk/SdkContext.tsx)
- subscribe and listen to balances: [`src/balances/useBalances.ts`](./src/balances/useBalances.ts)
- transfer native tokens: [`src/modals/TransferAmountModal.tsx`](./src/modals/TransferAmountModal.tsx)

Read more about SDK in [documentation](https://docs.unique.network/build/sdk/getting-started.html)

## Wallets

This boilerplate supports `Polkadot{.js}` and `MetaMask` wallets as well as Local signers.

- learn how to connect wallets: [`src/accounts`](./src/accounts/)
- learn how to create a local signer: [`src/accounts/LocalAccountSigner.ts`](./src/accounts/LocalAccountSigner.ts)
- read more about working with accounts in [documentation](https://docs.unique.network/tutorials/work-with-accounts.html) 