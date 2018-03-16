import {Controller, Mutation, Query} from "../../../../src";
import {Category} from "../entity/Category";
import {CategorySaveArgs} from "../args/CategorySaveArgs";
import {CategoryRepository} from "../repository/CategoryRepository";

@Controller()
export class CategoryController {

    constructor(private categoryRepository: CategoryRepository) {
    }

    @Query()
    categories(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    @Query()
    category({ id }: { id: number }): Promise<Category> {
        return this.categoryRepository.findById(id);
    }

    @Mutation()
    categorySave(args: CategorySaveArgs): Promise<Category> {
        return this.categoryRepository.save(args);
    }

}