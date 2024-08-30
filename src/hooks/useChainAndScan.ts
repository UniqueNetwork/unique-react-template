import { useEffect, useState } from 'react';
import {
  UniqueChain,
  UniqueChainInstance,
  UniqueScan,
  UniqueScanInstance,
} from '@unique-nft/sdk';

type ChainAndScan = {
  chain: UniqueChainInstance | null;
  scan: UniqueScanInstance | null;
};

const endpointsByNetwork = {
  unique: {
    chain: 'https://rest.unique.network/v2/unique',
    scan: 'https://api-unique.uniquescan.io/v2',
  },
  opal: {
    chain: 'https://rest.unique.network/v2/opal',
    scan: 'https://api-opal.uniquescan.io/v2',
  },
};

/**
 * Custom hook to initialize and access `UniqueChain` and `UniqueScan` instances for a specified network.
 * 
 * @param {keyof typeof endpointsByNetwork} network - The name of the network to connect to (e.g., 'unique', 'opal').
 * 
 * @example
 * ```typescript
 * const { chain, scan, loading } = useChainAndScan('unique');
 * 
 * if (!loading) {
 *   // Interact with the chain and scan instances
 * }
 * ```
 */
export const useChainAndScan = (network: keyof typeof endpointsByNetwork) => {
  const [data, setData] = useState<ChainAndScan>({ chain: null, scan: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getChainAndScan = async () => {
      try {
        const uniqueChain = UniqueChain({
          baseUrl: endpointsByNetwork[network].chain,
        });

        const uniqueScan = UniqueScan({
          baseUrl: endpointsByNetwork[network].scan,
        });

        setData({ chain: uniqueChain, scan: uniqueScan });
      } catch (error) {
        console.error('Error fetching chain and scan:', error);
      } finally {
        setLoading(false);
      }
    };

    getChainAndScan();
  }, [network]);

  return { ...data, loading };
};
