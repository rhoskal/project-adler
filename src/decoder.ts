import * as D from "io-ts/Decoder";

export const AuthResponse = D.struct({
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

export const ChangeTeamResponse = D.struct({
  id: D.string,
  name: D.string,
});

export const CreateTemplateResponse = D.struct({
  id: D.string,
  name: D.string,
});
