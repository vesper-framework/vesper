import {buildVesperSchema, vesper} from "../../../src";
import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import {graphiqlExpress} from "apollo-server-express";
import {PostController} from "./controller/PostController";
import {Post} from "./entity/Post";

buildVesperSchema({
    controllers: [PostController],
    entities: [Post],
    schemas: [__dirname + "/schema/**/*.graphql"]
}).then(schema => {

    const app = express();
    app.use(cors());
    app.use("/graphql", bodyParser.json(), vesper(schema));
    app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));
    app.listen(3000, (error: any) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log("Server is up and running on port 3000");
    });

}).catch(error => console.error(error));