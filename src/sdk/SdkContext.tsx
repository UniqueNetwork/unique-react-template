import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAccountFromMnemonic } from "./accounts";
import { connectSdk } from "./connect";

export type SdkContextValueType = {
  sdk: any | undefined;
};

export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
});

const corsAnywhere = "http://localhost:8080/";
// const corsAnywhere = '';
export const baseUrl = `${corsAnywhere}https://rest.unique.network/v2/opal`;
//some test acc
const SUBSTRATE_MNEMONIC =
  "produce provide explain away market town collect toast finger urban doll seminar";

export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<any>();

  useEffect(() => {
    void (async () => {
      const account = getAccountFromMnemonic(SUBSTRATE_MNEMONIC);
      const sdk = await connectSdk(baseUrl, account);
      setSdk(sdk);
    })();
  }, []);

  return (
    <SdkContext.Provider value={useMemo(() => ({ sdk }), [sdk])}>
      {children}
    </SdkContext.Provider>
  );
};
