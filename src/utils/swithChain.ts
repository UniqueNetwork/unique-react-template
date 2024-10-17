import { switchChain } from '@wagmi/core';
import { config } from "../components/WalletConnectProviders";

export const switchNetwork = async () => {
  const chainId = parseInt(process.env.REACT_APP_CHAIN_ID ?? "8880", 10);

  await switchChain(config, { chainId });
}