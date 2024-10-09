import { UniqueChain } from "@unique-nft/sdk";
import { Account, WalletsType } from "../accounts/types";

/**
 * Connects to the Unique SDK using the provided SDK endpoint.
 * Documentation: https://docs.unique.network/build/sdk/v2/quick-start.html
 *
 * This function initializes a connection to the Unique Network by creating
 * an instance of `UniqueChain`. The connection is established using the specified
 * SDK endpoint and optionally an account for signing transactions.
 *
 * @param sdkEndpoint - The URL of the SDK endpoint to connect to. You can find public 
 * endpoints here: https://docs.unique.network/reference/sdk-endpoints.html
 * @param account - (Optional) An account object of type `ISr25519Account` used for
 * signing transactions on the network. If not provided, the connection will be made
 * without an account, allowing read-only interactions with the network.
 *
 * @returns A promise that resolves to an instance of `UniqueChain`, which can be used
 * to interact with the Unique Network.
 *
 * @example
 * ```typescript
 * const sdkEndpoint = "https://rest.unique.network/opal/v1";
 * const account = Sr25519Account.fromUri("mnemonic seed phrase ...");
 * const uniqueChain = await connectSdk(sdkEndpoint, account);
 * ```
 */
export const connectSdk = async (
  sdkEndpoint: string,
  account?: Account<WalletsType> 
) => {
  const uniqueChain = UniqueChain({
    baseUrl: sdkEndpoint,
    //@ts-ignore
    account,
  });

  return uniqueChain;
};

export type UniqueChainType = ReturnType<typeof UniqueChain>;