import { Web3OnboardProvider } from '@subwallet-connect/react';
import { AccountsContextProvider } from './accounts/AccountsContext';
import './App.css';
import { AccountsPage } from './pages/Accounts';
import { SdkProvider } from './sdk/SdkContext';
import { SignByLocalSignerModalProvider } from './signModal/SignByLocalSignerModalContext';
import web3Onboard from './web3-onboard';

function App() {
  return (
    <div className="App">
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <SdkProvider>
          <SignByLocalSignerModalProvider>
            <AccountsContextProvider>
              <AccountsPage />
            </AccountsContextProvider>
          </SignByLocalSignerModalProvider>
        </SdkProvider>
      </Web3OnboardProvider>
    </div>
  );
}

export default App;
