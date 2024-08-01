# Unique Network React Boilerplate

This boilerplate aims to simplify working with Unique Network and Unique SDK.

> [!CAUTION]
> This boilerplate uses Unique SDK-2.0-alpha. If you want to use stable version proceed to https://github.com/UniqueNetwork/accounts-react-example

```sh
npm install
npm run start
```

## Unique Network SDK

This boilerplate utilizes `@unique-nft/sdk` which allows an easy and efficient way to interact with substrate-based networks.

Learn how to:
- connect to SDK: [`src/sdk/SdkContext.tsx`](./src/sdk/SdkContext.tsx)
- transfer native tokens: [`src/modals/TransferAmountModal.tsx`](./src/modals/TransferAmountModal.tsx)

Read more about SDK in [documentation](https://docs.unique.network/build/sdk/getting-started.html)

## Wallets

This boilerplate supports `Polkadot{.js}` wallet.

- learn how to connect wallets: [`src/accounts`](./src/accounts/)
- read more about working with accounts in [documentation](https://docs.unique.network/tutorials/work-with-accounts.html) 
