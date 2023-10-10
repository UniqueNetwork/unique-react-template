import { AccountsContextProvider } from './accounts/AccountsContext';
import './App.css';
import { AccountsPage } from './pages/Accounts';
import { SdkProvider } from './sdk/SdkContext';
import { SignByLocalSignerModalProvider } from './signModal/SignByLocalSignerModalContext';

function App() {
  return (
    <div className="App">
      <SdkProvider>
        <SignByLocalSignerModalProvider>
          <AccountsContextProvider>
            <AccountsPage />
          </AccountsContextProvider>
        </SignByLocalSignerModalProvider>
      </SdkProvider>
    </div>
  );
}

export default App;
