//@ts-nocheck
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { getAccountFromMnemonic } from "./accounts";
import { connectSdk } from "./connect";

export type SdkContextValueType = {
  sdk: any | undefined
  chainProperties: ChainPropertiesResponse | undefined
}

export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
  chainProperties: undefined
});

// const corsAnywhere = 'http://localhost:8080/';
const corsAnywhere = '';
export const baseUrl = `${corsAnywhere}https://rest.unique.network/v2/opal`;
//some test acc
const SUBSTRATE_MNEMONIC = 'produce provide explain away market town collect toast finger urban doll seminar';

export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<any>();
  const [chainProperties, setChainProperties] = useState<any>();

  useEffect(() => {
    void (async () => {
    const account = getAccountFromMnemonic(SUBSTRATE_MNEMONIC);
    const sdk = await connectSdk(baseUrl, account);
    const balance = await sdk.balance.get({address: account.address});
    setSdk(sdk);
  })();
    // void (async () => {
    //   const chainProperties = await sdk?.common.chainProperties();
    //   setChainProperties(chainProperties);
    // })();
  }, []);   

  return <SdkContext.Provider value={useMemo(() => ({ sdk, chainProperties }), [sdk, chainProperties])}>
      {children}
    </SdkContext.Provider>;
};