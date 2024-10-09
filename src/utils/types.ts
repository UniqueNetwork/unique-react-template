export interface TokenAttribute {
  value: string | number;
  trait_type: string;
}

export interface Token {
  tokenId: number;
  owner: string;
  image?: string | undefined | null;
  attributes?: TokenAttribute[] | undefined | null;
}
