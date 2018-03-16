var PostController = require("./controller/PostController").PostController;
var CategoryController = require("./controller/CategoryController").CategoryController;
var PostResolver = require("./resolver/PostResolver").PostResolver;
var Post = require("./entity/Post").Post;
var Category = require("./entity/Category").Category;

class PostModule {

    constructor() {
        this.schemas = [__dirname + "/schema/**/*.graphql"];
        this.controllers = [
            { controller: PostController, action: "posts", type: "query" },
            { controller: PostController, action: "post", type: "query" },
            { controller: PostController, action: "postSave", type: "mutation" },
            { controller: PostController, action: "postDelete", type: "mutation" },
            { controller: CategoryController, action: "categories", type: "query" },
            { controller: CategoryController, action: "category", type: "query" },
            { controller: CategoryController, action: "categorySave", type: "mutation" },
        ];
        this.resolvers = [
            { resolver: PostResolver, model: Post, methods: [{ methodName: "categoryNames", many: true }] },
        ];
        this.entities = [
            Post,
            Category
        ];
    }

}

module.exports = {
    PostModule: PostModule
};