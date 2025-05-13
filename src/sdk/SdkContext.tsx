import {
  createContext,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { UniqueChain } from "@unique-nft/sdk";
import { useAccountsContext } from "../accounts/AccountsContext";

export type UniqueChainType = ReturnType<typeof UniqueChain>;

export type SdkContextValueType = {
  sdk?: UniqueChainType;
};

/**
 * React context for providing the Unique SDK instance throughout the application.
 *
 * @remarks
 * This context allows any component in the application to access the initialized
 * Unique SDK, enabling interaction with the Unique Network.
 */
export const SdkContext = createContext<SdkContextValueType>({
  sdk: undefined,
});

export const baseUrl = process.env.REACT_APP_REST_URL || "";

/**
 * A provider component that initializes the Unique SDK and supplies it via context to child components.
 *
 * @param children - The child components that will have access to the Unique SDK through the context.
 * @returns A React component that provides the initialized Unique SDK to its children.
 *
 * @example
 * ```tsx
 * <SdkProvider>
 *   <App />
 * </SdkProvider>
 * ```
 */
export const SdkProvider = ({ children }: PropsWithChildren) => {
  const [sdk, setSdk] = useState<UniqueChainType>();
  const { selectedAccount } = useAccountsContext();

  useEffect(() => {
    if (selectedAccount) {
      //@ts-expect-error wait update utils
      const sdkInstance = UniqueChain({ baseUrl, account: selectedAccount });
      setSdk(sdkInstance);
    } else {
      const sdkInstance = UniqueChain({ baseUrl });
      setSdk(sdkInstance);
    }
  }, [selectedAccount]);

  const sdkContextValue = useMemo(() => ({ sdk }), [sdk]);

  return (
    <SdkContext.Provider value={sdkContextValue}>
      {children}
    </SdkContext.Provider>
  );
};

export const useSdkContext = () => useContext(SdkContext);
