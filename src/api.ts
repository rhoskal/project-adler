import axios from "axios";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { Env } from "./types";
import * as Decoder from "./decoder";

export const createToken = (): RTE.ReaderTaskEither<Env, unknown, string> => {
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

export const changeTeamName = (
  teamId: string,
  teamName: string,
): RTE.ReaderTaskEither<Env, unknown, { id: string; name: string }> => {
  const graphqlQuery = {
    query: `
      mutation ChangeTeamName {
        editTeam(input: { id: teamId, name: teamName }) {
          id
          name
        }
      }
    `,
    variables: {
      input: {
        id: teamId,
        name: teamName,
      },
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
              url: `${env.apiHost}/graphql`,
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
          Decoder.ChangeTeamResponse.decode(axiosResponse.data.editTeam),
          E.map((decoded) => decoded),
        ),
      );
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
