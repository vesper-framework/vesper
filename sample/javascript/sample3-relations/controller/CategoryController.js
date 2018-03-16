var EntityManager = require("typeorm").EntityManager;
var Category = require("../entity/Category").Category;

class CategoryController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    categories() {
        return this.entityManager.find(Category);
    }

    category({ id }) {
        return this.entityManager.findOne(Category, id);
    }

    categorySave(args) {
        return this.entityManager.save(Category, {
            id: args.id,
            name: args.name
        });
    }

}

module.exports = {
    CategoryController: CategoryController
};