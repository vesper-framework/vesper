import {EntityManager, FindManyOptions} from "typeorm";
import {Service} from "typedi";
import {Post} from "../entity/Post";
import {PostSaveArgs} from "../args/PostSaveArgs";
import {Category} from "../entity/Category";
import {PostsArgs} from "../args/PostsArgs";
import {RandomGenerator} from "../service/RandomGenerator";

@Service()
export class PostRepository {

    constructor(private entityManager: EntityManager,
                private randomGenerator: RandomGenerator) {
    }

    find(args: PostsArgs): Promise<Post[]> {

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

    findById(id: number): Promise<Post> {
        return this.entityManager.findOne(Post, id);
    }

    async save(args: PostSaveArgs): Promise<Post> {

        const post = args.id ? await this.entityManager.findOneOrFail(Post, args.id) : new Post();
        post.title = `${args.title} #${this.randomGenerator.generate()}`;
        post.text = args.text;
        if (args.categoryIds)
            post.categories = await this.entityManager.findByIds(Category, args.categoryIds);
        
        return this.entityManager.save(post);
    }

    async remove(id: number): Promise<boolean> {
        const post = await this.entityManager.findOne(Post, id);
        await this.entityManager.remove(post);
        return true;
    }

}