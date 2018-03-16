var EntityManager = require("typeorm").EntityManager;
var Category = require("../entity/Category").Category;

class PostResolver {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    categoryNames(post) {
        return this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoin("category.posts", "post", "post.id = :postId", { postId: post.id })
            .getMany()
            .then(categories => categories.map(category => category.name));
    }

}

module.exports = {
    PostResolver: PostResolver
};