import {ArgsValidator, Resolve, Resolver, ResolverInterface} from "../../../../src";
import {Post} from "../entity/Post";
import {PostLikesArgs} from "../args/PostLikesArgs";
import {PostLikesArgsValidator} from "../validator/PostLikesArgsValidator";

@Resolver(Post)
export class PostResolver implements ResolverInterface<Post> {

    @Resolve()
    @ArgsValidator(PostLikesArgsValidator)
    likes(post: Post, args: PostLikesArgs) {
        if (args.owner === "all") {
            return post.id * 10;
        } else {
            return 1;
        }
    }

}