import {bootstrap} from "../../../src";
import {PhotoController} from "./controller/PhotoController";
import {UserController} from "./controller/UserController";
import {User} from "./entity/User";
import {Photo} from "./entity/Photo";
import {PhotoResolver} from "./resolver/PhotoResolver";
import {getRepository} from "typeorm";
import {CurrentUser} from "./model/CurrentUser";

bootstrap({
    port: 3000,
    schemas: [__dirname + "/schema/**/*.graphql"],
    controllers: [
        PhotoController,
        UserController
    ],
    entities: [
        Photo,
        User
    ],
    resolvers: [
        PhotoResolver
    ],
    setupContainer: async (container, action) => {
        // trivial implementation, in reality it should be token-based authorization
        const user = await getRepository(User).findOneOrFail(action.request.query.id);
        const currentUser = new CurrentUser();
        currentUser.id = user.id;
        currentUser.name = user.firstName + " " + user.lastName;
        container.set(CurrentUser, currentUser);
    }
});