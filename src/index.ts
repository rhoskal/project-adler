import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/function";

import * as Api from "./api";
import { Env } from "./types";

const main = async () => {
  const env: Env = {
    accessKeyId: process.env.FLATFILE_ACCESS_KEY_ID || "",
    apiHost: process.env.FLATFILE_API_HOST || "",
    secretAccessKey: process.env.FLATFILE_SECRET_ACCESS_KEY || "",
  };

  const token = await pipe(RTE.run(Api.createToken(), env));
  console.log(token);
};

main();
