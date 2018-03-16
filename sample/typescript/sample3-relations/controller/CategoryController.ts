import {Controller, Mutation, Query} from "../../../../src";
import {EntityManager} from "typeorm";
import {Category} from "../entity/Category";
import {CategorySaveArgs} from "../args/CategorySaveArgs";

@Controller()
export class CategoryController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    categories(): Promise<Category[]> {
        return this.entityManager.find(Category);
    }

    @Query()
    category({ id }: { id: number }): Promise<Category> {
        return this.entityManager.findOne(Category, id);
    }

    @Mutation()
    async categorySave(args: CategorySaveArgs): Promise<Category> {
        const category = args.id ? await this.entityManager.findOneOrFail(Category, args.id) : new Category();
        category.name = args.name;
        return this.entityManager.save(category);
    }

}