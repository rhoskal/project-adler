import axios from "axios";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe, constant } from "fp-ts/function";

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

export const getUserId = (email: string) => {};

export const changeTeamName = (
  teamId: string,
  teamName: string,
): RTE.ReaderTaskEither<Env, unknown, { id: string; name: string }> => {
  const graphqlQuery: GqlQuery = {
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
        TE.tryCatch(() => {
          return axios({
            method: "POST",
            url: `${env.apiHost}/graphql`,
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
  const graphqlQuery: GqlQuery = {
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

export const createDataHook = (schemaId: string): RTE.ReaderTaskEither<Env, unknown, string> => {
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

export const updateDataHook = (
  id: string,
): RTE.ReaderTaskEither<Env, unknown, { id: string; name: string; code: string }> => {
  const name: string = `DH-${Math.floor(Date.now() / 1000)}`;
  const packageJSON: string = '{"dependencies":{}}';
  const code: string = `
    module.exports = ({ recordBatch, _session, logger }) => {
      recordBatch.records.forEach((record) => {
        logger.info("hello");
      });
    };
  `;

  const graphqlQuery: GqlQuery = {
    query: `
      mutation UpdateDataHook(
        $id: UUID!
        $name: String
        $packageJSON: String
        $code: String
      ) {
        updateDataHook(id: $id, name: $name, packageJSON: $packageJSON, code: $code) {
          dataHook {
            id
            name
            code
          }
        }
      }
    `,
    variables: {
      id,
      name,
      packageJSON,
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

// {"operationName":"UpdateDataHook","variables":{"id":"4d0d934d-13b3-4bd3-b486-813636735483","name":"Test1","archived":false,"code":"// Fill in the function below with your code, or select a template.\nmodule.exports = async ({recordBatch, session, logger}) => { \n  recordBatch.records.forEach((record) => {\n  //   record\n  //     // set the value of all records in the column example to 'flatfile'\n  //     .set('example', 'flatfile')\n  //     // setting a value on a non-existent field will result in a console error: 'non-existing-field' doesn't exist\n  //     .set('non-existing-field', 'flatfile')\n  //     // add a custom comment to a field\n  //     .addComment(['example'], 'this is a custom comment')\n  //     // add a custom warning to a field\n  //     .addWarning(['example'], 'this is a warning')\n  //     // add a custom error to a field\n  //     .addError('email', 'this is a custom error message')\n  })\n}","description":"","packageJSON":"{\"dependencies\":{}}"},"query":"mutation UpdateDataHook($id: UUID!, $name: String, $description: String, $code: String, $packageJSON: String, $archived: Boolean) {\n  updateDataHook(\n    id: $id\n    name: $name\n    archived: $archived\n    description: $description\n    code: $code\n    packageJSON: $packageJSON\n  ) {\n    schema {\n      id\n    }\n    dataHook {\n      id\n      archived\n      name\n      description\n      code\n      packageJSON\n      deploymentState\n      lambdaARN\n      createdAt\n      updatedAt\n      root {\n        id\n      }\n      ancestor {\n        id\n      }\n    }\n  }\n}\n"}
