var EntityManager = require("typeorm").EntityManager;
var Post = require("../entity/Post").Post;

class PostController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    posts() {
        return this.entityManager.find(Post);
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