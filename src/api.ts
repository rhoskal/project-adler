import axios from "axios";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { constant, pipe } from "fp-ts/function";

import { Env, GqlQuery } from "./types";
import * as Decoder from "./decoder";

export const createToken = (): RTE.ReaderTaskEither<Env, unknown, string> => {
  return pipe(
    RTE.ask<Env>(),
    RTE.chain((env) => {
      return RTE.fromTaskEither(
        TE.tryCatch(() => {
          return axios({
            method: "POST",
            url: `https://${env.apiHost}/auth/access-key/exchange`,
            data: {
              accessKeyId: env.accessKeyId,
              secretAccessKey: env.secretAccessKey,
            },
          });
        }, constant),
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

export const createTemplate = ({
  teamId,
  templateName,
  schema,
}: {
  teamId: string;
  templateName: string;
  schema: unknown;
}): RTE.ReaderTaskEither<Env, unknown, Decoder.Template> => {
  const graphqlQuery: GqlQuery = {
    query: `
      mutation CreateTemplate(
        $name: String!
        $teamId: ID!
        $schema: JsonSchemaDto
        $environmentId: UUID
      ) {
        createSchema(
          name: $name
          teamId: $teamId
          jsonSchema: $schema
          environmentId: $environmentId
        ) {
          id
          name
        }
      }
    `,
    variables: {
      teamId,
      name: templateName,
      schema,
      environmentId: "3bc34101-db20-458a-83e1-28a955ad037e",
    },
  };

  return pipe(
    RTE.ask<Env>(),
    RTE.chain((env) => {
      return RTE.fromTaskEither(
        TE.tryCatch(() => {
          return axios({
            method: "POST",
            url: `https://${env.apiHost}/graphql`,
            headers: {
              Authorization: `Bearer ${env.accessToken}`,
            },
            data: graphqlQuery,
          });
        }, constant),
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

export const createDataHook = (
  schemaId: string,
): RTE.ReaderTaskEither<Env, unknown, Decoder.EmptyHook> => {
  const graphqlQuery: GqlQuery = {
    query: `
      mutation CreateDataHook($schemaId: ID!) {
        createDataHook(schemaId: $schemaId) {
          id
        }
      }
    `,
    variables: {
      schemaId,
    },
  };

  return pipe(
    RTE.ask<Env>(),
    RTE.chain((env) => {
      return RTE.fromTaskEither(
        TE.tryCatch(() => {
          return axios({
            method: "POST",
            url: `https://${env.apiHost}/graphql`,
            headers: {
              Authorization: `Bearer ${env.accessToken}`,
            },
            data: graphqlQuery,
          });
        }, constant),
      );
    }),
    RTE.chainW((response) => {
      const axiosResponse = response.data;

      return RTE.fromEither(
        pipe(
          Decoder.CreateDataHookResponse.decode(axiosResponse.data.createDataHook),
          E.map((decoded) => decoded),
        ),
      );
    }),
  );
};

export const updateDataHook = ({
  id,
  name,
  description,
  code,
}: {
  id: string;
  name: string;
  description: string;
  code: string;
}): RTE.ReaderTaskEither<Env, unknown, Decoder.Hook> => {
  const graphqlQuery: GqlQuery = {
    query: `
      mutation UpdateDataHook(
        $id: UUID!
        $name: String
        $description: String
        $code: String
      ) {
        updateDataHook(
          id: $id
          name: $name
          description: $description
          code: $code
        ) {
          dataHook {
            id
            name
            description
            packageJSON
            code
          }
        }
      }
    `,
    variables: {
      id,
      name,
      description,
      code,
    },
  };

  return pipe(
    RTE.ask<Env>(),
    RTE.chain((env) => {
      return RTE.fromTaskEither(
        TE.tryCatch(() => {
          return axios({
            method: "POST",
            url: `https://${env.apiHost}/graphql`,
            headers: {
              Authorization: `Bearer ${env.accessToken}`,
            },
            data: graphqlQuery,
          });
        }, constant),
      );
    }),
    RTE.chainW((response) => {
      const axiosResponse = response.data;

      return RTE.fromEither(
        pipe(
          Decoder.UpdateDataHookResponse.decode(axiosResponse.data.updateDataHook.dataHook),
          E.map((decoded) => decoded),
        ),
      );
    }),
  );
};
