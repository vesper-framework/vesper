class PostLikesArgsValidator {

    validate(args) {
        if (args.owner !== undefined && args.owner !== "my" && args.owner !== "all")
            throw new Error(`Owner can be only "my" or "all".`);
    }

}

module.exports = {
    PostLikesArgsValidator: PostLikesArgsValidator
};