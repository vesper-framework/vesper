var getManager = require("typeorm").getManager;
var PostController = require("./controller/PostController").PostController;
var Post = require("./entity/Post").Post;
var bootstrap = require("../../../src").bootstrap;

bootstrap({
    port: 3000,
    controllers: [
        { controller: PostController, action: "posts", type: "query" },
        { controller: PostController, action: "post", type: "query" },
        { controller: PostController, action: "postSave", type: "mutation" },
        { controller: PostController, action: "postDelete", type: "mutation" },
    ],
    entities: [Post],
    schemas: [__dirname + "/schema/**/*.graphql"]
}).then(framework => {

    // inserting some fake data
    var manager = getManager();
    var post1 = { title: "post title #1", text: "post text #1" };
    var post2 = { title: "post title #2", text: "post text #2" };
    var post3 = { title: "post title #3", text: "post text #3" };
    return manager.save(Post, [post1, post2, post3]);

});