var EntityManager = require("typeorm").EntityManager;
var Post = require("../entity/Post").Post;

class PostController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    posts(args) {

        let findOptions = {};
        if (args.limit)
            findOptions.take = args.limit;
        if (args.offset)
            findOptions.skip = args.offset;
        if (args.sortBy === "last")
            findOptions.order = { "id": "DESC" };
        if (args.sortBy === "name")
            findOptions.order = { "name": "ASC" };

        return this.entityManager.find(Post, findOptions);
    }

    post({ id }) {
        return this.entityManager.findOne(Post, id);
    }

    postSave(args) {
        return this.entityManager.save(Post, {
            id: args.id,
            title: args.title,
            text: args.text
        });
    }

    postDelete({ id }) {
        return this.entityManager
            .findOne(Post, id)
            .then(post => this.entityManager.remove(post))
            .then(() => true);
    }

}

module.exports = {
    PostController: PostController
};