export type AssetTypeSummary = {
  description: string;
  dynamic: boolean;
  label: string;
  tag: string;
  writers: string[] | null;
};

export type AssetSchemaProp = {
  dataType: string;
  description: string;
  isKey: boolean;
  label: string;
  readOnly: boolean;
  required: boolean;
  tag: string;
  writers: string[] | null;
};

export type AssetSchema = {
  description: string;
  label: string;
  props: AssetSchemaProp[];
  tag: string;
};

export type AssetRef = string | Record<string, unknown>;

export type TvShow = {
  title: string;
  description: string;
  recommendedAge: number;
  "@assetType"?: "tvShows";
  "@key"?: string;
  "@lastTouchBy"?: string;
  "@lastTx"?: string;
  "@lastTxID"?: string;
  "@lastUpdated"?: string;
  [key: string]: unknown;
};

export type CreateTvShowInput = {
  title: string;
  description: string;
  recommendedAge: number;
};

export type Season = {
  number: number;
  tvShow: AssetRef;
  year: number;
  "@assetType"?: "seasons";
  [key: string]: unknown;
};

export type Episode = {
  season: AssetRef;
  episodeNumber: number;
  title: string;
  releaseDate: string;
  description: string;
  rating?: number;
  "@assetType"?: "episodes";
  [key: string]: unknown;
};

export type Watchlist = {
  title: string;
  description?: string;
  tvShows?: AssetRef[];
  "@assetType"?: "watchlist";
  [key: string]: unknown;
};

export type TxProp = {
  dataType: string;
  description: string;
  isKey?: boolean;
  label: string;
  readOnly?: boolean;
  required: boolean;
  tag: string;
  writers: string[] | null;
};

export type TxSchema = {
  description: string;
  label: string;
  props: TxProp[];
  tag: string;
};

export type TxSummary = {
  description: string;
  dynamic?: boolean;
  label: string;
  tag: string;
  writers: string[] | null;
};