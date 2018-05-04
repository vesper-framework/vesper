#!/usr/bin/env node
import "reflect-metadata";
import {InitCommand} from "./commands/InitCommand";
import {GenerateModelsCommand} from "./commands/GenerateModelsCommand";

require("yargs")
    .usage("Usage: $0 <command> [options]")
    .command(new InitCommand())
    .command(new GenerateModelsCommand())
    .demandCommand(1)
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help")
    .argv;

require("yargonaut")
    .style("blue")
    .style("yellow", "required")
    .helpStyle("green")
    .errorsStyle("red");
