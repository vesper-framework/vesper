import {bootstrap} from "../../../src";
import {PostController} from "./controller/PostController";
import {Post} from "./entity/Post";

bootstrap({
    port: 3000,
    controllers: [PostController],
    entities: [Post],
    schemas: [__dirname + "/schema/**/*.graphql"]
});