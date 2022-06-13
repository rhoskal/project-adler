import * as D from "io-ts/Decoder";

export const AuthResponseDecoder = D.struct({
  accessToken: D.string,
  user: D.struct({
    id: D.number,
    name: D.string,
    email: D.string,
    type: D.string,
    jobTitle: D.nullable(D.string),
    githubUsername: D.nullable(D.string),
    trialEndsAt: D.nullable(D.string),
    lastLoginAt: D.string,
    createdAt: D.string,
    updatedAt: D.string,
  }),
});

export const ChangeTeamResponseDecoder = D.struct({
  id: D.string,
  name: D.string,
});
