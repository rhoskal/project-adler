import axios from "axios";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import gql from "graphql-tag";

import { Env } from "./types";
import * as Codecs from "./codec";

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
    RTE.map((response) => {
      return pipe(
        Codecs.AuthResponseDecoder.decode(response.data),
        E.map((decoded) => decoded.accessToken),
        O.fromEither, //not sure this should be an Option
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

export const changeTeamName =
  (teamId: string, teamName: string) =>
  (accessToken: string): RTE.ReaderTaskEither<Env, unknown, void> => {
    return pipe(
      RTE.ask<Env>(),
      RTE.chain((env) => {
        return RTE.fromTaskEither(
          TE.tryCatch(
            () => {
              return axios({
                method: "POST",
                url: `${env.apiHost}/graphql`,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
                data: gql`
                  mutation ChangeTeamName {
                    editTeam(input: { id: teamId, name: teamName }) {
                      id
                      name
                    }
                  }
                `,
              });
            },
            (reason) => reason,
          ),
        );
      }),
      RTE.map((response) => {
        const decoded = Codecs.ChangeTeamResponseDecoder.decode(response.data);

        if (E.isRight(decoded)) {
          return;
        }
      }),
    );
  };
