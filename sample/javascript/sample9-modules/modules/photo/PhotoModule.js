var PhotoController = require("./controller/PhotoController").PhotoController;
var Photo = require("./entity/Photo").Photo;

class PhotoModule {

    constructor() {
        this.schemas = [__dirname + "/schema/**/*.graphql"];
        this.controllers = [
            { controller: PhotoController, action: "photos", type: "query" },
            { controller: PhotoController, action: "photo", type: "query" },
            { controller: PhotoController, action: "photoSave", type: "mutation" },
            { controller: PhotoController, action: "photoDelete", type: "mutation" },
        ];
        this.entities = [
            Photo
        ];
    }

}

module.exports = {
    PhotoModule: PhotoModule
};