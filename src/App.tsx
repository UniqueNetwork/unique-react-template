import { AccountsContextProvider } from "./accounts/AccountsContext";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AccountsPage } from "./pages/Accounts";
import { SdkProvider } from "./sdk/SdkContext";
import CollectionPage from "./pages/CollectionPage";
import { Header } from "./components/Header";
import AccountPage from "./pages/AccountPage";
import TokenPage from "./pages/TokenPage";
import styled from "styled-components";

const ContentLayout = styled.div`
  width: 90vw;
  max-width: 1260px;
  margin: 0 auto;
`;

function App() {
  return (
    <div className="App">
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
                <Route path="/account/:accountId" element={<AccountPage />} />
                <Route
                  path="/token/:collectionId/:tokenId"
                  element={<TokenPage />}
                />
              </Routes>
            </ContentLayout>
          </Router>
        </AccountsContextProvider>
      </SdkProvider>
    </div>
  );
}

export default App;
