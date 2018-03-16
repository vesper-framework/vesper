import {ArgsValidator, Controller, Mutation, Query} from "../../../../src";
import {Post} from "../entity/Post";
import {PostSaveArgs} from "../args/PostSaveArgs";
import {EntityManager, FindManyOptions} from "typeorm";
import {PostsArgs} from "../args/PostsArgs";
import {PostsArgsValidator} from "../validator/PostsArgsValidator";
import {PostSaveArgsValidator} from "../validator/PostSaveArgsValidator";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    @ArgsValidator(PostsArgsValidator)
    posts(args: PostsArgs): Promise<Post[]> {
        const findOptions: FindManyOptions<any> = {};
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

    @Query()
    post({ id }: { id: number }): Promise<Post> {
        return this.entityManager.findOne(Post, id);
    }

    @Mutation()
    @ArgsValidator(PostSaveArgsValidator)
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