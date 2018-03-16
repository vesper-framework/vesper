var EntitySchema = require("typeorm").EntitySchema;

var Category = new EntitySchema({
    name: "Category",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        name: {
            type: String
        }
    },
    relations: {
        posts: {
            type: "many-to-many",
            target: "Post",
            inverseSide: "categories"
        }
    }
});

module.exports = {
    Category: Category
};