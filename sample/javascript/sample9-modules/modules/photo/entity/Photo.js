var EntitySchema = require("typeorm").EntitySchema;

var Photo = new EntitySchema({
    name: "Photo",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        title: {
            type: String
        },
        filename: {
            type: String
        }
    }
});

module.exports = {
    Photo: Photo
};