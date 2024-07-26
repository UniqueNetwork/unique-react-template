import { AccountsContextProvider } from "./accounts/AccountsContext";
import "./App.css";
import { AccountsPage } from "./pages/Accounts";
import { SdkProvider } from "./sdk/SdkContext";

function App() {
  return (
    <div className="App">
      <SdkProvider>
        <AccountsContextProvider>
          <AccountsPage />
        </AccountsContextProvider>
      </SdkProvider>
    </div>
  );
}

export default App;
