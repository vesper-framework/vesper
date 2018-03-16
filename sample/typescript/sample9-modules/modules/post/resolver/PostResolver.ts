import {Resolve, Resolver, ResolverInterface} from "../../../../../../src";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";
import {Category} from "../entity/Category";

@Resolver(Post)
export class PostResolver implements ResolverInterface<Post> {

    constructor(private entityManager: EntityManager) {
    }

    @Resolve()
    async categoryNames(posts: Post[]) {
        const postIds = posts.map(post => post.id);
        const categories = await this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoinAndSelect("category.posts", "post", "post.id IN (:...postIds)", { postIds })
            .getMany();

        return posts.map(post => {
            return categories
                .filter(category => category.posts.some(categoryPost => categoryPost.id === post.id))
                .map(category => category.name);
        });
    }

}