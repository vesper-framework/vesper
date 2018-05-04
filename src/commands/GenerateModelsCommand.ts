import {bootstrap} from "../index";
import {executeWithOptions} from "graphql-code-generator/dist/cli";
import {prettify} from "graphql-code-generator/dist/utils/prettier";
import * as fs from "fs";

const chalk = require("chalk");

/**
 * Generates models for the given graphql schemas.
 */
export class GenerateModelsCommand {

    command = "generate:models";
    describe = "Generates models for the given graphql schemas.";

    builder(yargs: any) {
        return yargs
            .option("schemas", {
                alias: "s",
                describe: "GraphQL schemas to be loaded.",
                required: true
            })
            .option("port", {
                alias: "p",
                describe: "Port which should be used for express server.",
                required: true
            })
            .option("out", {
                alias: "o",
                describe: "Path for generation output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory.",
                required: true
            });
    }

    async handler(argv: any) {
        bootstrap({
            port: argv.port,
            schemas: [process.cwd() + "/" + argv.schemas]
        }).then(framework => {
            console.log("Schemas are loaded and application was bootstrapped.");

            return executeWithOptions({
                template: "typescript",
                url: "http://127.0.0.1:" + argv.port + "/graphql",
                out: process.cwd() + "/" + argv.out
            })
                .then((generationResult: any[]) => {
                    console.log(`Generation result contains total of ${generationResult.length} files...`);

                    generationResult.forEach(async (result: any) => {
                        // if (!options.overwrite && fileExists(result.filename)) {
                        //     console.log(`Generated file skipped (already exists, and no-overwrite flag is ON): ${result.filename}`);
                        //     return;
                        // }

                        const content = result.content.trim();

                        if (content.length === 0) {
                            console.log(`Generated file skipped (empty): ${result.filename}`);

                            return;
                        }

                        fs.writeFileSync(result.filename, await prettify(result.filename, result.content));
                        console.log(`Generated file written to ${result.filename}`);
                    });

                    return framework.stop();
                })
                .catch(error => {
                    console.error(error);
                    return framework.stop();
                });
        });
    }

}
