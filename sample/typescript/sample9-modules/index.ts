import {bootstrap} from "../../../src";
import {PhotoModule} from "./modules/photo/PhotoModule";
import {PostModule} from "./modules/post/PostModule";

bootstrap({
    port: 3000,
    schemas: [__dirname + "/modules/**/schema/**/*.graphql"],
    modules: [
        PhotoModule,
        PostModule
    ]
});