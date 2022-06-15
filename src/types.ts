export type Env = {
  accessKeyId: Readonly<string>;
  apiHost: Readonly<string>;
  secretAccessKey: Readonly<string>;
  accessToken: Readonly<string>;
  teamId: Readonly<string>;
};

export type GqlQuery = {
  query: Readonly<string>;
  variables: Readonly<Record<string, any>>;
};
