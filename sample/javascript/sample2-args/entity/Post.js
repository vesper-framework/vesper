var EntitySchema = require("typeorm").EntitySchema;

var Post = new EntitySchema({
    name: "Post",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        title: {
            type: String
        },
        text: {
            type: String
        }
    }
});

module.exports = {
    Post: Post
};