import axios from "axios";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { Env } from "./types";
import { AuthResponseDecoder } from "./codec";

export const createToken = (): RTE.ReaderTaskEither<Env, unknown, O.Option<string>> => {
  return pipe(
    RTE.ask<Env>(),
    RTE.chain((env) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios({
              method: "POST",
              url: `https://${env.apiHost}/auth/access-key/exchange`,
              data: {
                accessKeyId: env.accessKeyId,
                secretAccessKey: env.secretAccessKey,
                expiresIn: 43200,
              },
            });
          },
          (reason) => reason,
        ),
      );
    }),
    RTE.map(({ data }) => {
      return pipe(
        AuthResponseDecoder.decode(data),
        E.map((decoded) => decoded.accessToken),
        O.fromEither,
      );
    }),
  );
};

// {
//     "statusCode": 401,
//     "message": "Access key id or secret provided is not valid",
//     "error": "Unauthorized"
// }

export const getUserId = (email: string) => {};
