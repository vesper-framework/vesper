import {Controller, Mutation, Query} from "../../../../src";
import {Post} from "../entity/Post";
import {PostSaveArgs} from "../args/PostSaveArgs";
import {EntityManager} from "typeorm";
import {PostsArgs} from "../args/PostsArgs";
import {Logger} from "../service/Logger";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager,
                private logger: Logger) {
    }

    @Query()
    posts(args: PostsArgs): Promise<Post[]> {
        this.logger.log("requesting posts with args: " + JSON.stringify(args));
        return this.entityManager.find(Post);
    }

    @Query()
    post({ id }: { id: number }): Promise<Post> {
        this.logger.log("requesting post by id: " + id);
        return this.entityManager.findOne(Post, id);
    }

    @Mutation()
    async postSave(args: PostSaveArgs): Promise<Post> {
        this.logger.log("saving post with args: " + JSON.stringify(args));
        const post = args.id ? await this.entityManager.findOneOrFail(Post, args.id) : new Post();
        post.title = args.title;
        post.text = args.text;
        return this.entityManager.save(post);
    }

    @Mutation()
    async postDelete({ id }: { id: number }): Promise<boolean> {
        this.logger.log("deleting post by id: " + id);
        const post = await this.entityManager.findOne(Post, id);
        await this.entityManager.remove(post);
        return true;
    }

}