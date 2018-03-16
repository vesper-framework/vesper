import {bootstrap} from "../../../src";
import {TokenController} from "./controller/TokenController";

bootstrap({
    port: 3000,
    controllers: [TokenController],
    schemas: [__dirname + "/schema/**/*.graphql"]
});