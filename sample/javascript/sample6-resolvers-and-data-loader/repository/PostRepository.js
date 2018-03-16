var EntityManager = require("typeorm").EntityManager;
var RandomGenerator = require("../service/RandomGenerator").RandomGenerator;
var Post = require("../entity/Post").Post;
var Category = require("../entity/Category").Category;

class PostRepository {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
        this.randomGenerator = container.get(RandomGenerator);
    }

    find(args) {

        var findOptions = {};
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

    findById(id) {
        return this.entityManager.findOne(Post, id);
    }

    save(args) {
        var post = {
            id: args.id,
            title: `${args.title} #${this.randomGenerator.generate()}`,
            text: args.text
        };

        if (args.categoryIds) {
            return this.entityManager
                .findByIds(Category, args.categoryIds)
                .then(categories => {
                    post.categories = categories;
                    return this.entityManager.save(post);
                });

        } else {
            return this.entityManager.save(post);
        }
    }

    remove(id) {
        return this.entityManager
            .findOneOrFail(Post, id)
            .then(post => this.entityManager.remove(post))
            .then(() => true);
    }

}

module.exports = {
    PostRepository: PostRepository
};