var PostRepository = require("../repository/PostRepository").PostRepository;

class PostController {

    constructor(container) {
        this.postRepository = container.get(PostRepository);
    }

    posts(args) {
        return this.postRepository.find(args);
    }

    post({ id }) {
        return this.postRepository.findById(id);
    }

    postSave(args) {
        return this.postRepository.save(args);
    }

    postDelete({ id }) {
        return this.postRepository.remove(id);
    }

}

module.exports = {
    PostController: PostController
};