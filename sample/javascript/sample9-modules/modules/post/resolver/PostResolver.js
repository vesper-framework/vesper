var EntityManager = require("typeorm").EntityManager;
var Category = require("../entity/Category").Category;

class PostResolver {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    categoryNames(posts) {
        const postIds = posts.map(post => post.id);
        return this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoinAndSelect("category.posts", "post", "post.id IN (:...postIds)", { postIds })
            .getMany()
            .then(categories => {
                return posts.map(post => {
                    return categories
                        .filter(category => category.posts.some(categoryPost => categoryPost.id === post.id))
                        .map(category => category.name);
                });
            });
    }

}

module.exports = {
    PostResolver: PostResolver
};