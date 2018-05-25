import {Controller, Mutation, Query} from "../../../../src";
import {Post} from "../entity/Post";
import {PostSaveArgs} from "../args/PostSaveArgs";
import {EntityManager, FindOptions} from "typeorm";
import {PostsArgs} from "../args/PostsArgs";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    posts(args: PostsArgs): Promise<Post[]> {
        const findOptions: FindOptions<Post> = {};
        if (args.limit)
            findOptions.take = args.limit;
        if (args.offset)
            findOptions.skip = args.offset;
        if (args.sortBy === "last")
            findOptions.order = { id: "desc" };
        if (args.sortBy === "name")
            findOptions.order = { title: "asc" };

        return this.entityManager.find(Post, findOptions);
    }

    @Query()
    post({ id }: { id: number }): Promise<Post> {
        return this.entityManager.findOne(Post, id);
    }

    @Mutation()
    async postSave(args: PostSaveArgs): Promise<Post> {
        const post = args.id ? await this.entityManager.findOneOrFail(Post, args.id) : new Post();
        post.title = args.title;
        post.text = args.text;
        return this.entityManager.save(post);
    }

    @Mutation()
    async postDelete({ id }: { id: number }): Promise<boolean> {
        const post = await this.entityManager.findOne(Post, id);
        await this.entityManager.remove(post);
        return true;
    }

}