import {Resolve, Resolver, ResolverInterface} from "../../../../src";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";
import {Category} from "../entity/Category";

@Resolver(Post)
export class PostResolver implements ResolverInterface<Post> {

    constructor(private entityManager: EntityManager) {
    }

    @Resolve()
    async categoryNames(post: Post) {
        const categories = await this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoin("category.posts", "post", "post.id = :postId", { postId: post.id })
            .getMany();

        return categories.map(category => category.name);
    }


}