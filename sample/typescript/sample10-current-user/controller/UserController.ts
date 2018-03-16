import {Controller, Mutation, Query} from "../../../../src";
import {EntityManager} from "typeorm";
import {User} from "../entity/User";
import {UserSaveArgs} from "../args/UserSaveArgs";

@Controller()
export class UserController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    users(): Promise<User[]> {
        return this.entityManager.find(User);
    }

    @Query()
    user({ id }: { id: number }): Promise<User> {
        return this.entityManager.findOne(User, id);
    }

    @Mutation()
    async userSave(args: UserSaveArgs): Promise<User> {
        const user = args.id ? await this.entityManager.findOneOrFail(User, args.id) : new User();
        user.firstName = args.firstName;
        user.lastName = args.lastName;
        return this.entityManager.save(user);
    }

    @Mutation()
    async userDelete({ id }: { id: number }): Promise<boolean> {
        const user = await this.entityManager.findOne(User, id);
        await this.entityManager.remove(user);
        return true;
    }

}