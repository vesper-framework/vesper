import {Service} from "typedi";
import {ArgsValidatorInterface} from "../../../../src";
import {PostsArgs} from "../args/PostsArgs";

@Service()
export class PostsArgsValidator implements ArgsValidatorInterface<PostsArgs> {

    validate(args: PostsArgs) {
        if (args.limit !== undefined && args.limit > 100)
            throw new Error(`Limit cannot be more then 100.`);

        if (args.limit !== undefined && args.limit < 1)
            throw new Error(`Limit cannot be less then 1.`);

        if (args.offset !== undefined && args.offset < 0)
            throw new Error(`Offset cannot be less then zero.`);

        if (args.sortBy && args.sortBy !== "name" && args.sortBy !== "last")
            throw new Error(`Sort can only be by name or by last`);
    }

}