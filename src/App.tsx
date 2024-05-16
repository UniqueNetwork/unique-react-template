import { Web3OnboardProvider } from "@subwallet-connect/react";
import { AccountsContextProvider } from "./accounts/AccountsContext";
import "./App.css";
import { AccountsPage } from "./pages/Accounts";
import { SdkProvider } from "./sdk/SdkContext";
import web3Onboard from "./web3-onboard";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const projectId = process.env.REACT_APP_PROJECT_ID || "";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const chains = [
  {
    id: 8882,
    name: "OPAL by UNIQUE",
    nativeCurrency: { name: "OPL", symbol: "OPL", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://rpc.unique.network/"],
      },
    },
  },
] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  // explorerExcludedWalletIds: []
  // ...wagmiOptions // Optional - Override createConfig parameters
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  // includeWalletIds: [
  //   'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  //   '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  //   'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
  // ],
  // defaultChain
  enableAnalytics: true,
  enableOnramp: true,
});

//@ts-ignore
// export const ethereumClient = new EthereumClient(config, chains)
// export const ethereumClient = new providers.JsonRpcProvider(transport.url, network)

function App() {
  return (
    <div className="App">
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <SdkProvider>
              <AccountsContextProvider>
                <AccountsPage />
              </AccountsContextProvider>
            </SdkProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </Web3OnboardProvider>
    </div>
  );
}

export default App;
