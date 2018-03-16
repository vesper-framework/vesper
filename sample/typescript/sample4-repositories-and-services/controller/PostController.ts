import {Controller, Mutation, Query} from "../../../../src";
import {Post} from "../entity/Post";
import {PostSaveArgs} from "../args/PostSaveArgs";
import {PostRepository} from "../repository/PostRepository";
import {PostsArgs} from "../args/PostsArgs";

@Controller()
export class PostController {

    constructor(private postRepository: PostRepository) {
    }

    @Query()
    posts(args: PostsArgs): Promise<Post[]> {
        return this.postRepository.find(args);
    }

    @Query()
    post({ id }: { id: number }): Promise<Post> {
        return this.postRepository.findById(id);
    }

    @Mutation()
    postSave(args: PostSaveArgs): Promise<Post> {
        return this.postRepository.save(args);
    }

    @Mutation()
    async postDelete({ id }: { id: number }): Promise<boolean> {
        return this.postRepository.remove(id);
    }


}