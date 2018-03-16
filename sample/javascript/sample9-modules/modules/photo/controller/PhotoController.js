var EntityManager = require("typeorm").EntityManager;
var Photo = require("../entity/Photo").Photo;

class PhotoController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    photos() {
        return this.entityManager.find(Photo);
    }

    photo({ id }) {
        return this.entityManager.findOne(Photo, id);
    }

    photoSave(args) {
        return this.entityManager.save({
            id: args.id,
            title: args.title,
            filename: args.filename,
        });
    }

    photoDelete({ id }) {
        return this.entityManager
            .findOne(Photo, id)
            .then(photo => this.entityManager.remove(photo))
            .then(() => true);
    }

}

module.exports = {
    PhotoController: PhotoController
};