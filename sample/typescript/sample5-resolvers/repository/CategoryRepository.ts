import {EntityManager} from "typeorm";
import {Service} from "typedi";
import {Category} from "../entity/Category";
import {CategorySaveArgs} from "../args/CategorySaveArgs";

@Service()
export class CategoryRepository {

    constructor(private entityManager: EntityManager) {
    }

    find(): Promise<Category[]> {
        return this.entityManager.find(Category);
    }

    findById(id: number): Promise<Category> {
        return this.entityManager.findOne(Category, id);
    }

    async save(args: CategorySaveArgs): Promise<Category> {
        const category = args.id ? await this.entityManager.findOneOrFail(Category, args.id) : new Category();
        category.name = args.name;
        return this.entityManager.save(category);
    }

}