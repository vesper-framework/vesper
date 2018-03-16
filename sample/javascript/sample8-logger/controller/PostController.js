var EntityManager = require("typeorm").EntityManager;
var Post = require("../entity/Post").Post;
var Logger = require("../service/Logger").Logger;

class PostController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
        this.logger = container.get(Logger);
    }

    posts(args) {
        this.logger.log("requesting posts with args: " + JSON.stringify(args));
        return this.entityManager.find(Post);
    }

    post({ id }) {
        this.logger.log("requesting post by id: " + id);
        return this.entityManager.findOne(Post, id);
    }

    postSave(args) {
        this.logger.log("saving post with args: " + JSON.stringify(args));
        return this.entityManager.save(Post, {
            id: args.id,
            title: args.title,
            text: args.text
        });
    }

    postDelete({ id }) {
        this.logger.log("deleting post by id: " + id);
        return this.entityManager
            .findOne(Post, id)
            .then(post => this.entityManager.remove(post))
            .then(() => true);
    }

}

module.exports = {
    PostController: PostController
};