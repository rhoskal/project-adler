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

export const CreateTemplateResponse = D.struct({
  id: D.string,
  name: D.string,
});

export type Template = D.TypeOf<typeof CreateTemplateResponse>;

export const CreateDataHookResponse = D.struct({
  id: D.string,
});

export type EmptyHook = D.TypeOf<typeof CreateDataHookResponse>;

export const UpdateDataHookResponse = D.struct({
  id: D.string,
  name: D.string,
  description: D.string,
  // packageJSON: D.record(D.string),
  code: D.string,
});

export type Hook = D.TypeOf<typeof UpdateDataHookResponse>;
