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
import { WalletConnectProviders } from "./components/WalletConnectProviders";

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
      </WalletConnectProviders>
    </div>
  );
}

export default App;
