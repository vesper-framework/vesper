import {Service} from "typedi";
import {ArgsValidatorInterface} from "../../../../src/interface/ArgsValidatorInterface";
import {PostSaveArgs} from "../args/PostSaveArgs";

@Service()
export class PostSaveArgsValidator implements ArgsValidatorInterface<PostSaveArgs> {

    validate(args: PostSaveArgs) {

        if (args.title === undefined)
            throw new Error(`Post title must be defined.`);

        if (args.title.length < 10)
            throw new Error(`Post title is too short. Minimal length is 10 characters.`);

        if (args.title.length > 200)
            throw new Error(`Post title is too long. Maximal length is 200 characters.`);

        if (args.text === undefined)
            throw new Error(`Post text must be defined.`);

        if (args.text.length < 100)
            throw new Error(`Post text is too short. Minimal length is 100 characters.`);

        if (args.text.length > 2000)
            throw new Error(`Post text is too long. Maximal length is 2000 characters.`);

    }

}