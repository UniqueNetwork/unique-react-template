# Unique Network EVM Workshop

In Unique Network, the token's metadata is stored on-chain. This makes it very easy to mutate the token's attributes, such as images or traits.

In this challenge, your goal is to create a game using Solidity and Unique Network SDK. Only the contract should mutate the token's attributes—no backends and no off-chain services should be used for NFT mutation. It can be elementary, but try to make it engaging.

For rapid development, we provide libraries and a frontend template so that you can concentrate on the application logic, not the setting boilerplate code. Let's begin with setting up the project.

## Project configuration

#### 1. Clone this branch

```sh
git clone --branch workshop-evm https://github.com/UniqueNetwork/unique-react-template.git
```

#### 2. Install packages

The following script will install packages for react template and contracts HardHat project. Finally it will compile the contracts.

```sh
yarn install:all
```