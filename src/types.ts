import * as O from "fp-ts/Option";
// import { AxiosError } from "axios";

export type Env = {
  accessKeyId: string;
  apiHost: string;
  secretAccessKey: string;
};

// export type RequestError = {
//   _tag: "RequestError";
//   error: string;
// };
//
// export const mkRequestError = (e: string) => ({
//   _tag: "RequesetError",
//   error: e,
// });
