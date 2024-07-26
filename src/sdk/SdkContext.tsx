import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { connectSdk } from "./connect";

export type SdkContextValueType = {
  sdk: any | undefined;
};

export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
});

export const baseUrl = "https://rest.unique.network/v2/opal";

export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<any>();

  useEffect(() => {
    void (async () => {
      const sdk = await connectSdk(baseUrl);
      setSdk(sdk);
    })();
  }, []);

  return (
    <SdkContext.Provider value={useMemo(() => ({ sdk }), [sdk])}>
      {children}
    </SdkContext.Provider>
  );
};
