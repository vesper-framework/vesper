import {bootstrap} from "../../../src";
import {PostController} from "./controller/PostController";
import {Post} from "./entity/Post";
import {CategoryController} from "./controller/CategoryController";
import {Category} from "./entity/Category";
import {getManager} from "typeorm";

bootstrap({
    port: 3000,
    controllers: [PostController, CategoryController],
    entities: [Post, Category],
    schemas: [__dirname + "/schema/**/*.graphql"]
}).then(async framework => {

    // inserting some fake data
    const manager = getManager();
    const category1 = new Category();
    category1.name = "category #1";
    const category2 = new Category();
    category2.name = "category #2";
    await manager.save([category1, category2]);
    const post1 = new Post();
    post1.title = post1.text = "post #1";
    post1.categories = [category1, category2];
    const post2 = new Post();
    post2.title = post2.text = "post #2";
    post2.categories = [category1];
    const post3 = new Post();
    post3.title = post3.text = "post #3";
    post3.categories = [category2];
    await manager.save([post1, post2, post3]);

});