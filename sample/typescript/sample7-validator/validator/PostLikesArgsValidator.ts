import {Service} from "typedi";
import {ArgsValidatorInterface} from "../../../../src";
import {PostLikesArgs} from "../args/PostLikesArgs";

@Service()
export class PostLikesArgsValidator implements ArgsValidatorInterface<PostLikesArgs> {

    validate(args: PostLikesArgs) {
        if (args.owner !== undefined && args.owner !== "my" && args.owner !== "all")
            throw new Error(`Owner can be only "my" or "all".`);
    }

}