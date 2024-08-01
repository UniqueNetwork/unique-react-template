export type DecodedInfixOrUrlOrCidAndHash = ({
    urlInfix?: string;
    hash?: string | null;
  } | {
    url?: string;
    hash?: string | null;
  } | {
    ipfsCid?: string;
    hash?: string | null;
  }) & {
    fullUrl?: string | null;
  };