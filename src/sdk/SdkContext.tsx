import { createContext, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { ChainPropertiesResponse } from "@unique-nft/sdk";
import { Sdk } from '@unique-nft/sdk/full';

export type SdkContextValueType = {
  sdk: Sdk | undefined
  chainProperties: ChainPropertiesResponse | undefined
}

export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
  chainProperties: undefined
});

const baseUrl = "https://rest.unique.network/opal/v1/";

export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<Sdk>();
  const [chainProperties, setChainProperties] = useState<ChainPropertiesResponse>();

  useEffect(() => {

    const sdk = new Sdk({
      baseUrl,
    });
    setSdk(sdk);

    void (async () => {
      const chainProperties = await sdk?.common.chainProperties();
      setChainProperties(chainProperties);
    })();
  }, []);   

  return <SdkContext.Provider value={useMemo(() => ({ sdk, chainProperties }), [sdk, chainProperties])}>
      {children}
    </SdkContext.Provider>;
};