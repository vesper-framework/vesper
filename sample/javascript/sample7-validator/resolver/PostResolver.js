class PostResolver {

    likes(post, args) {
        if (args.owner === "all") {
            return post.id * 10;
        } else {
            return 1;
        }
    }

}

module.exports = {
    PostResolver: PostResolver
};