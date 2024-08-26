import { AccountsContextProvider } from "./accounts/AccountsContext";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AccountsPage } from "./pages/AccountListPage";
import { SdkProvider } from "./sdk/SdkContext";
import CollectionPage from "./pages/CollectionPage";
import { Header } from "./components/Header";
import SingleAccountPage from "./pages/SingleAccountPage";
import TokenPage from "./pages/TokenPage";
import styled from "styled-components";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const ContentLayout = styled.div`
  width: 90vw;
  max-width: 1260px;
  margin: 0 auto;
  margin-bottom: 60px;
`;

const projectId = "cd9b26cc5adb69cd8f82d309b4b3dfac";

const metadata = {
  name: "Unique - Wallet Connect",
  description: "Unique boilerplate",
  url: "https://plate.uniquenetwork.dev/",
  icons: [""],
};

export const chains = [
  {
    id: 8880,
    name: "Unique Mainnet",
    nativeCurrency: { name: "UNQ", symbol: "UNQ", decimals: 18 },
    rpcUrls: {
      default: {
        http: ["https://rpc.unique.network"],
      },
    },
  },
] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  includeWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    "ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18",
  ],
  enableSwaps: false,
  enableOnramp: false,
  enableAnalytics: false,
  allowUnsupportedChain: true,
});

function App() {
  return (
    <div className="App">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <SdkProvider>
            <AccountsContextProvider>
              <Router>
                <Header />
                <ContentLayout>
                  <Routes>
                    <Route path="/" element={<AccountsPage />} />
                    <Route
                      path="/collection/:collectionId"
                      element={<CollectionPage />}
                    />
                    <Route
                      path="/account/:accountId"
                      element={<SingleAccountPage />}
                    />
                    <Route
                      path="/token/:collectionId/:tokenId"
                      element={<TokenPage />}
                    />
                    <Route path="*" element={<>NOT FOUND</>} />
                  </Routes>
                </ContentLayout>
              </Router>
            </AccountsContextProvider>
          </SdkProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
