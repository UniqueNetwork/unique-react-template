import styled from "styled-components";
import { AccountsContextProvider } from "./accounts/AccountsContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { AccountsPage } from "./pages/AccountListPage";
import CollectionPage from "./pages/CollectionPage";
import { Header } from "./components/Header";
import SingleAccountPage from "./pages/SingleAccountPage";
import TokenPage from "./pages/TokenPage";
import { WalletConnectProviders } from "./components/WalletConnectProviders";
import { EvmTest } from "./pages/EvmTest";
import { SdkProvider } from "./sdk/SdkContext";

const ContentLayout = styled.div`
  width: 90vw;
  max-width: 1260px;
  margin: 0 auto;
  margin-bottom: 60px;
`;

function App() {
  return (
    <div className="App">
      <WalletConnectProviders>
        <AccountsContextProvider>
          <SdkProvider>
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
                  <Route
                    path="/evm-test"
                    element={<EvmTest />}
                  />
                  <Route path="*" element={<>NOT FOUND</>} />
                </Routes>
              </ContentLayout>
            </Router>
          </SdkProvider>
        </AccountsContextProvider>
      </WalletConnectProviders>
    </div>
  );
}

export default App;
