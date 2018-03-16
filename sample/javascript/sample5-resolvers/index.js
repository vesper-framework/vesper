var getManager = require("typeorm").getManager;
var PostController = require("./controller/PostController").PostController;
var CategoryController = require("./controller/CategoryController").CategoryController;
var PostResolver = require("./resolver/PostResolver").PostResolver;
var Post = require("./entity/Post").Post;
var Category = require("./entity/Category").Category;
var bootstrap = require("../../../src").bootstrap;

bootstrap({
    port: 3000,
    controllers: [
        { controller: PostController, action: "posts", type: "query" },
        { controller: PostController, action: "post", type: "query" },
        { controller: PostController, action: "postSave", type: "mutation" },
        { controller: PostController, action: "postDelete", type: "mutation" },

        { controller: CategoryController, action: "categories", type: "query" },
        { controller: CategoryController, action: "category", type: "query" },
        { controller: CategoryController, action: "categorySave", type: "mutation" },
    ],
    resolvers: [
        { resolver: PostResolver, model: Post, methods: ["categoryNames"] },
    ],
    entities: [
        Post,
        Category
    ],
    schemas: [__dirname + "/schema/**/*.graphql"]
}).then(framework => {

    // inserting some fake data
    var category1 = { name: "category #1" };
    var category2 = { name: "category #2" };

    var post1 = { title: "post title #1", text: "post text #1", categories: [category1, category2] };
    var post2 = { title: "post title #2", text: "post text #2", categories: [category1] };
    var post3 = { title: "post title #3", text: "post text #3", categories: [category2] };

    getManager()
        .save(Category, [category1, category2])
        .then(() => getManager().save(Post, [post1, post2, post3]));
});