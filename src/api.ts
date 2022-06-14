import axios from "axios";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import gql from "graphql-tag";

import { Env } from "./types";
import * as Decoder from "./decoder";

// export const createToken = (): RTE.ReaderTaskEither<Env, unknown, string> => {
export const createToken = () => {
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
              },
            });
          },
          (reason) => reason,
        ),
      );
    }),
    // RTE.map((response) => {
    //   return pipe(
    //     Decoder.AuthResponse.decode(response.data),
    //     E.map((decoded) => decoded.accessToken),
    //     // E.getOrElse(() => ""),
    //   );
    // }),
    RTE.chainW((response) => {
      return RTE.fromEither(
        pipe(
          Decoder.AuthResponse.decode(response.data),
          E.map((decoded) => decoded.accessToken),
        ),
      );
    }),
  );
};

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
        const decoded = Decoder.ChangeTeamResponse.decode(response.data);

        if (E.isRight(decoded)) {
          return;
        }
      }),
    );
  };

export const createTemplate = (
  teamId: string,
  templateName: string,
  schema: unknown,
): RTE.ReaderTaskEither<Env, unknown, { id: string; name: string }> => {
  const graphqlQuery = {
    query: `
      mutation CreateTemplate($name: String!, $teamId: ID!, $schema: JsonSchemaDto) {
        createSchema(name: $name, teamId: $teamId, jsonSchema: $schema) {
          id
          name
        }
      }
    `,
    variables: {
      teamId,
      name: templateName,
      schema,
    },
  };

  return pipe(
    RTE.ask<Env>(),
    RTE.chain((env) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios({
              method: "POST",
              url: `https://${env.apiHost}/graphql`,
              headers: {
                Authorization: `Bearer ${env.accessToken}`,
              },
              data: graphqlQuery,
            });
          },
          (reason) => reason,
        ),
      );
    }),
    RTE.chainW((response) => {
      const axiosResponse = response.data;

      return RTE.fromEither(
        pipe(
          Decoder.CreateTemplateResponse.decode(axiosResponse.data.createSchema),
          E.map((decoded) => decoded),
        ),
      );
    }),
  );
};
