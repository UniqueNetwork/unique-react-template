# Unique Network EVM Workshop

Unique Network stores token metadata on-chain, making modifying attributes such as images or traits easy.

## Challenge Overview

Your goal in this challenge is to create a simple, engaging game using Solidity and the Unique Network SDK. The game's smart contract should be the only mechanism that modifies NFT attributes—no backends or off-chain services should be involved. While the game can be simple, focus on creating an interactive experience.

To speed up development, we offer libraries and a frontend template, allowing you to concentrate on application logic instead of writing repetitive code.

## Demo

This repository showcases a demo of a basic Web3 game where users have the ability to breed creatures and engage them in battles. As creatures gain experience, the contract triggers their evolution, resulting in changes to their image and attributes. It's worth noting that all operations take place entirely on the blockchain, eliminating the need for any backend or off-chain services.

![Demo](/docs/demo.png)

## Overview of the Unique SDK

Let's briefly discuss Unique Network's architecture and its SDK's role.

> [Unique Docs](https://docs.unique.network/build/sdk/v2/quick-start.html)
> 
> The SDK facilitates seamless integration of Unique Network's capabilities into the Web3 application, bypassing the need for direct low-level API interaction. It enables you to mint collections and tokens and manage account balances more effortlessly.

Unique Network is a Substrate-based blockchain that supports both Substrate and EVM interfaces. For EVM, you can use familiar tools like MetaMask and ethers.js. The Unique SDK bridges the gap, allowing you to manage Substrate accounts, send transactions, and query data from the blockchain and the indexer.

For this workshop, the SDK is pre-configured, but you can explore how it works through the following links:

- [Unique SDK quick start](https://docs.unique.network/build/sdk/v2/quick-start.html)
- [EVM and Smart Contracts](https://docs.unique.network/build/sdk/v2/evm.html). This section explains how Unique SDK allows Substrate accounts to work with Ethereum smart contracts.

## Project Setup

#### 1. Clone the repository

```sh
git clone --branch workshop-evm https://github.com/UniqueNetwork/unique-react-template.git
```

#### 2. Install dependencies

Run the following script to install the required packages for the React front end and the Solidity contracts. This will also compile the contracts.

```sh
yarn install:all
```

## Project structure

The project consists of two main components: a React frontend template in the root and a HardHat-based Solidity project in the `/contracts` directory.

### Contracts

The contracts are managed via HardHat and the `@unique-nft/contracts` package, which is located in the `/contracts` directory. This workshop focuses on the main contract, `BreedingGame.sol`. We'll explore its functionality in more detail later.

> [!NOTE]
>
> To compile contracts:
> - From the root: `yarn compile:contracts`
> - From the `contracts` directory: `yarn compile`

You'll also find `scripts/deploy.ts` used to deploy the contract. The contract is pre-deployed to the testnet for this workshop, but you can modify and run this script to deploy your contract.

> [!NOTE]
> 
> Deploy contracts to the Opal testnet:
> - From the root: `yarn deploy:contracts`
> - From the `contracts` directory: `yarn deploy` 


Finally, let's have a look at the `hardhat.config.ts`.

```ts
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { viaIR: true },
  },
  paths: {
    artifacts: "../src/static/artifacts",
  },
  networks: {
    opal: {
      url: "https://rpc-opal.unique.network",
      accounts: [""]
    }
  }
};
```

Key Points:

- The highest supported Solidity version is 0.8.24
- The viaIR compilation pipeline is required.
- Compilation artifacts (such as ABI files) are saved in the project root for easy frontend access
- The predefined testnet is Opal. You can get test OPL tokens via the Telegram faucet: https://t.me/unique2faucet_opal_bot
- To deploy a contract, specify a private key in the `accounts` field. **Never commit your secrets to Git!**

### Frontend

The front is built with Create React App and the `@unique-nft/sdk`. It supports Ethereum wallets via WalletConnect and Substrate wallets via the Unique SDK.

Key Files:

1. Check out the [`.env`](./.env) file. This file contains all the required configurations to connect to the Opal network. Edit this if you want to switch to the mainnet.
2. Next, check the [`App.tsx`](./src/App.tsx) file. Key elements include:
   1. There is only one page in this template called `BreedingPage`.
   2. Providers for WalletConnect, Substrate wallets, and Unique SDK.


```ts
function App() {
  return (
    <div className="App">
      <WalletConnectProviders>
        <SdkProvider>
          <AccountsContextProvider>
            <Router>
              <Header />
              <ContentLayout>
                <Routes>
                  <Route path="/" element={<BreedingPage />} />
                  <Route path="*" element={<>NOT FOUND</>} />
                </Routes>
              </ContentLayout>
            </Router>
          </AccountsContextProvider>
        </SdkProvider>
      </WalletConnectProviders>
    </div>
  );
}
```

Now, look at the only existing page – open [`/pages/BreedingPage.tsx`](./src/pages/BreedingPage.tsx). You may see three hardcoded constants at the top level of the page component.

```ts
...
const BreedingPage = () => {
  const CONTRACT_ADDRESS = "0x8Cdff9BCC8d9Edd503D584488E2de5E9744CD049";
  const COLLECTION_ID = 3997;
  const EVOLVE_EXPERIENCE = 150;
...
```

- `CONTRACT_ADDRESS` is the address of the `BreedingGame.sol` already deployed to the Opal network.
- During the deployment, the contract creates a collection, and its ID is set to the `COLLECTION_ID` constant.
- The `EVOLVE_EXPERIENCE` constant relates to the logic of the game. It is the required experience the user's creature needs to collect to have the ability to evolve. We'll have a closer look at the contract a bit later.

Finally, let's have a look at some hooks:

```ts
  const {chain, scan} = useChainAndScan();
  const {selectedAccount} = useContext(AccountsContext);
```

1. [`useChainAndScan()`](./src/hooks/useChainAndScan.ts) hook provides access to the Unique SDK. `chain` is for sending transactions and retrieving data from the blockchain. `scan` is for retrieving data from the Unique Network Indexer.
2. [`useContext(AccountsContext)`](./src/accounts/AccountsContext.tsx) Manages connected wallet accounts

We return to observing the front end later. Once you're ready, start the front with:

```sh
yarn start
```

If something went wrong, check this:
- make sure packages are installed and contracts compiled `yarn install:all`
- don't forget to grab some tokens – https://t.me/unique2faucet_opal_bot

Connect your Substrate or Ethereum wallet (better both). Breed a couple of creatures and send them to the arena. Notice how tokens' attributes and images change. To make sure all the mutations are part of NFTs, not the application logic, find your NFTs at [Unique Scan](https://uniquescan.io/OPAL/collections/3997)

## Smart contract explained

Let's return to the contract and check how it works in detail.

But first, let's quickly explore how Unique Netwrok NFTs work in a nutshell.

Unique Network is a Substrate-first, NFT-specific blockchain. Special RPCs handle creating collections and NFTs, so you don't need to deploy contracts.

Here's an example of how to create collections and NFTs using the Unique SDK:

```ts
const collectionTx = await sdk.collection.create({
  name: "Collection Name",
  description: "Collection collection",
  symbol: "TST",
  info: {cover_image: {url: 'https://your.collection/cover.png'}},
});

const mintNftTx = await sdk.token.mintNFTs({
  collectionId: collectionTx.result.collectionId,
  tokens: [
    {data: {image: 'https://your.token/image1.png'}},
    {data: {image: 'https://your.token/image2.png'}},
  ]
});
```

In Unique Network, NFTs have unique identifiers that increment with every minted token. This architecture differs from EVM, where NFTs adhere to standards like ERC-721.

To make this architecture compatible with the EVM interface a set of precompiles are provided. You may check them in the [documentation](https://docs.unique.network/build/evm/smart-contracts/)

However, it is not enough to mint an NFT; to make this NFT visible for applications such as wallets, you need to stick to the particular metadata format. This could be a tricky task to implement using only low-level precompile interfaces. To solve this, we provide a contracts library that allow the minting of collections and tokens in the correct metadata format. Check available contracts and their functions at https://github.com/UniqueNetwork/unique-contracts

This boilerplate already has unique-contracts installed, but if you decide to create your project from scratch, here is the command:

```sh
yarn add -D @unique-nft/contracts
```

### Creating collection

Now, let's take a closer look at the [`BreedingGame.sol`](./contracts/contracts/BreedingGame.sol) contract. Let's start with the constructor function.

```solidity
constructor() payable CollectionMinter(true, true, false) {
    // Monsters can be of generation 0 or 1. Each generation has its own IPFS base URL.
    s_generationIpfs[
        0
    ] = "https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/QmedQFp656axCAvKjo1iXqozH4Ew7AvDx8SFM4sH3hYHj6/";
    s_generationIpfs[
        1
    ] = "https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/QmPqsyQRozG1vs2ZpgbPWQDbySqibaG6Q3sV7PGmSCxrBH/";

    // The contract mints a collection and becomes the collection owner,
    // so it has permissions to mutate its tokens' attributes.
    COLLECTION_ADDRESS = _mintCollection(
        "Evolved",
        "Breeding simulator",
        "EVLD",
        "https://orange-impressed-bonobo-853.mypinata.cloud/ipfs/QmQgGuP4LFST3tMF46vQKow1Ki6oe47GKan1GDjD7z2JPD"
    );
}
```

Make notice:
- The contract implements [`CollectionMinter`](https://github.com/UniqueNetwork/unique-contracts/blob/main/contracts/CollectionMinter.sol). Right in the constructor, this contract creates a collection using the `_mintCollection` function, which creates a Unique metadata-compatible collection. 
- In this game, every creature can evolve at some point. We created different IPFS folders for each generation using [Pinata](https://pinata.cloud/). Follow the links set to the `s_generationIpfs` to see all the available images.
- Because the contract has created the collection, it became the owner of this collection and can mutate its properties. To make this possible, we provided boolean flags – `CollectionMinter(true, true, false)`, which means token attributes will be mutable (true) by the collection admin (true) but not by the token owner (false).

> [!IMPORTANT]
>
> Unique Network requires a collection creation fee of 2 OPL tokens to be provided in additionally to the transaction fee, which is why the constructor is marked as payable

You may check the collection we already created in the [Unique Scan](https://uniquescan.io/OPAL/collections/3997)

Or you can deploy your contract by executing `yarn deploy:contracts`. Do not forget to set your private key to the hardhat.config.ts

### Creating NFTs

Let's take a look at the `breed` function.

```solidity
function breed(CrossAddress memory _owner) onlyMessageSender(_owner) external {
    // For simplicity, we have only 2 predefined images, type 1 or type 2.
    // Each player receives a pseudo-random token breed.
    uint32 randomTokenBreed = _getPseudoRandom(BREEDS, 1);

    // Construct token image URL.
    string memory randomImage = string.concat(
        s_generationIpfs[0],
        "monster-",
        Converter.uint2str(randomTokenBreed),
        ".png"
    );

    Attribute[] memory attributes = new Attribute[](4);
    // Each NFT has 4 traits. These traits are mutated when the `_fight` method is invoked.
    attributes[0] = Attribute({trait_type: "Experience", value: "0"});
    attributes[1] = Attribute({trait_type: "Victories", value: "0"});
    attributes[2] = Attribute({trait_type: "Defeats", value: "0"});
    attributes[3] = Attribute({trait_type: "Generation", value: "0"});

    uint256 tokenId = _createToken(COLLECTION_ADDRESS, randomImage, attributes, _owner);
    s_tokenStats[tokenId] = TokenStats({
        breed: randomTokenBreed,
        generation: 0,
        victories: 0,
        defeats: 0,
        experience: 0
    });
}
```

There are several essential concepts here. Let's learn about them.

#### CrossAddress struct

```solidity
function breed(CrossAddress memory _owner) onlyMessageSender(_owner)
```

In Unique Network, EVM contracts can be called by Substrate accounts via `evm.call` extrinsic, and we'll learn how to do it later. The problem is – that the EVM itself does not recognize the substrate address format; the `msg.sender` should be an Ethereum account. To make it possible to call contracts by Substrate accounts, every substrate account has its [ethereum mirror](https://docs.unique.network/build/evm/accounts.html). So whenever the substrate account calls contract, the `msg.sender` will be its mirror.

But if the contract's caller is always an ethereum address, how can we make a substrate account to become the owner of the future NFT?

To make this possible, the Unique EVM supports the `CrossAddress` structure, representing an "ethereum or substrate" account. Only one property can be filled out to consider the structure valid.

```solidity
struct CrossAddress {
    address eth;
    uint256 sub;
}
```

If the transaction's origin is an ethereum address (e.g., private keys stored in MetaMask), the `eth` property should be filled with a plain ethereum address, and the `sub` property should be 0. If the origin of the transaction is the substrate account, the `sub` property should be filled with the substrate public key, and the `eth` property should be `address(0)`.

One more crucial thing you may want to do is to validate that `msg.sender` is the provided CrossAddress `_owner`, and not just a random account. The helper contract `AddressValidator.sol` provides a set of modifiers for that–`onlyMessageSender` is one.

#### Creating token

Next, we pseudo-randomly select future NFT types and construct the link to the token's image.

```solidity
uint32 randomTokenBreed = _getPseudoRandom(BREEDS, 1);

string memory randomImage = string.concat(
    s_generationIpfs[0],
    "monster-",
    Converter.uint2str(randomTokenBreed),
    ".png"
);
```

After that, we establish a set of attributes (`Experience`, `Victories`, `Defeats`, `Generation`)—NFT traits, which the contract will change during the gameplay. It is essential to notice that these traits will be part of an NFT, not the application. Check [some token](https://uniquescan.io/opal/tokens/3997/3) of the created collection to understand how it will be displayed.

Finally, we create an NFT using the `_createToken` method from the [`TokenMinter`](https://github.com/UniqueNetwork/unique-contracts/blob/main/contracts/TokenMinter.sol) abstract contract, which mints an NFT to the provided `CrossAddress`.

### NFT attributes mutation

Finally, our contract provides functions that mutate the token's traits and image:

- `enterArena` - allows to fight one NFT against the other. The image of the loser will be changed to the exhausted. Both tokens will receive experience points.
- `recover` - allows to recover exhausted token image and make it normal again
- `evolve` - changes the token's generation attributes from 0 to 1, making its image look different.

These functions utilize `_setTrait` and `_setImage` functions from the [`TokenManager`](https://github.com/UniqueNetwork/unique-contracts/blob/main/contracts/TokenManager.sol) abstract contract.

That is the most essential concept you need to know! Feel free to explore this contract further. Or check [other recipes](https://github.com/UniqueNetwork/unique-contracts/tree/main/contracts/recipes) to learn the other concepts, such as sponsoring, in the unique-contracts repository.

In the last section, we will learn how to call the contract using both Substrate and Ethereum tools.

## Calling the contract

Return to the [`BreedingPage.tsx`](./src/pages/BreedingPage.tsx) and check the `sendContractTransaction` function.

This helper function checks whether the selected account is a Substrate or Ethereum signer.

If the signer is a Substrate account, it uses Unique SDK to perform `evm.call` extrinsic:

```ts
const result = await chain.evm.send(
  {
    functionName,
    functionArgs,
    contract: {
      address: CONTRACT_ADDRESS,
      abi: artifacts.abi,
    },
    gasLimit,
  },
  { signerAddress: selectedAccount.address },
  { signer: selectedAccount.signer }
);
```

If the signer is an Ethereum account, it uses ethers.js:

```ts
const provider = new ethers.BrowserProvider(window.ethereum);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  artifacts.abi,
  await provider.getSigner()
);
const tx = await contract[functionName](...functionArgs, { gasLimit });
```

Then we use it in handlers, for example, to breed a new creature:

```ts
await sendContractTransaction("breed", [crossAddress], 1_000_000n);
```

Remember, we need to provide a `CrossAddress` to make it work with Substrate accounts. For this purpose, we provide the `@unique-nft/utils` package.

```ts
import { Address } from "@unique-nft/utils";

...
let crossAddress = Address.extract.ethCrossAccountId(
  selectedAccount.address
);
```

The `Address.extract.ethCrossAccountId` function takes the account received from the AccountContext and converts it to a CrossAddress-compatible type.

> [IMPORTANT]
>
> Currently, `gasLimit` must be provided explicitly to avoid runtime errors. This will be fixed with future runtime upgrades.

## Final thoughts

In this workshop, we've learned how to create and mutate Unique Network native NFTs using Solidity smart contracts, the [Unique SDK](https://docs.unique.network/build/sdk/v2/quick-start.html), and the [unique-contracts](https://github.com/UniqueNetwork/unique-contracts) packages.

Now it is your turn! Here are a couple of ideas to implement:

- Digital Collectible Card Game
- On-Chain Adventure Text Quest
- Farming Simulator
- Kingdom-building strategy game
