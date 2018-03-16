var EntityManager = require("typeorm").EntityManager;
var Category = require("../entity/Category").Category;

class CategoryRepository {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    find() {
        return this.entityManager.find(Category);
    }

    findById(id) {
        return this.entityManager.findOne(Category, id);
    }

    save(args) {
        return this.entityManager.save(Category, {
            id: args.id,
            name: args.name
        });
    }

}

module.exports = {
    CategoryRepository: CategoryRepository
};