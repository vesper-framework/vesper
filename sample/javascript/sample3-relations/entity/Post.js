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
    },
    relations: {
        categories: {
            type: "many-to-many",
            joinTable: true,
            target: "Category",
            inverseSide: "posts"
        }
    }
});

module.exports = {
    Post: Post
};