import React from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain } from "viem";

const queryClient = new QueryClient();

const projectId = process.env.REACT_APP_PROJECT_ID as string;
const metadata = {
  name: "Unique - Wallet Connect",
  description: "Unique boilerplate",
  url: "https://plate.uniquenetwork.dev/",
  icons: [""],
};

const chains: readonly [Chain, ...Chain[]] = [
  {
    id: parseInt(process.env.REACT_APP_CHAIN_ID ?? "8880", 10),
    name: process.env.REACT_APP_CHAIN_NAME ?? "Unique Mainnet",
    nativeCurrency: {
      name: process.env.REACT_APP_CHAIN_NATIVE_CURRENCY_NAME ?? "UNQ",
      symbol: process.env.REACT_APP_CHAIN_NATIVE_CURRENCY_SYMBOL ?? "UNQ",
      decimals: parseInt("18", 10),
    },
    rpcUrls: {
      default: {
        http: [process.env.REACT_APP_CHAIN_RPC_URL ?? "https://rpc.unique.network"],
      },
    },
  },
] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

const METAMASK_ID = process.env.REACT_APP_METAMASK_ID as string;
const ZERION_ID = process.env.REACT_APP_ZERION_ID as string;
const TRUST_ID = process.env.REACT_APP_TRUST_ID as string;


createWeb3Modal({
  wagmiConfig: config,
  projectId,
  includeWalletIds: [
    METAMASK_ID, ZERION_ID, TRUST_ID
  ],
  enableSwaps: false,
  enableOnramp: false,
  enableAnalytics: false,
  allowUnsupportedChain: true,
});

export const WalletConnectProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
