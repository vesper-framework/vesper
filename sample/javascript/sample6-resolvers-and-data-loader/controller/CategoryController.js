var CategoryRepository = require("../repository/CategoryRepository").CategoryRepository;

class CategoryController {

    constructor(container) {
        this.categoryRepository = container.get(CategoryRepository);
    }

    categories() {
        return this.categoryRepository.find();
    }

    category({ id }) {
        return this.categoryRepository.findById(id);
    }

    categorySave(args) {
        return this.categoryRepository.save(args);
    }

}

module.exports = {
    CategoryController: CategoryController
};