import {GraphModule} from "../../../../../src/options/GraphModule";
import {Post} from "./entity/Post";
import {Category} from "./entity/Category";
import {PostResolver} from "./resolver/PostResolver";
import {PostController} from "./controller/PostController";
import {CategoryController} from "./controller/CategoryController";

export class PostModule implements GraphModule {

    controllers = [
        PostController,
        CategoryController
    ];

    entities = [
        Post,
        Category
    ];

    resolvers = [
        PostResolver
    ];

}