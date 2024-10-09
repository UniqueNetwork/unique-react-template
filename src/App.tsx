import { AccountsContextProvider } from "./accounts/AccountsContext";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SdkProvider } from "./sdk/SdkContext";
import { Header } from "./components/Header";
import styled from "styled-components";
import { WalletConnectProviders } from "./components/WalletConnectProviders";
import BreedingPage from "./pages/BreedingPage";

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

export default App;
