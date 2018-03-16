import {bootstrap} from "../../../src";
import {PostController} from "./controller/PostController";
import {Post} from "./entity/Post";
import {getManager} from "typeorm";
import {PostResolver} from "./resolver/PostResolver";

bootstrap({
    port: 3000,
    controllers: [PostController],
    entities: [Post],
    resolvers: [PostResolver],
    schemas: [__dirname + "/schema/**/*.graphql"]
}).then(async framework => {

    // inserting some fake data
    const manager = getManager();
    const post1 = new Post();
    post1.title = post1.text = "post #1";
    const post2 = new Post();
    post2.title = post2.text = "post #2";
    const post3 = new Post();
    post3.title = post3.text = "post #3";
    await manager.save([post1, post2, post3]);

});