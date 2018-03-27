# Services and Repositories

> This guide is for TypeScript users. JavaScript version is [here](../javascript/services-and-repositories.md).

All your application logic that is not directly related to controllers or resolvers 
can be extracted into separate classes called "services".
Services can be grouped by types, 
for example you can create "repository" services that will have a database queries,
you can create "manager" services that manage some business logic,
you can create "utility" services with utility functions.

Services allow you to keep your code clean and follow separation of concerns principle.
Here is an example how to create a simple service:

```typescript
import {Service} from "typedi";

@Service()
export class PasswordEncryptor {

    encrypt(password) {
        // ... do password encryption ...
        return password;
    }

}
```

Then you can use it in any other service (including controllers, resolvers, validators, etc.):

```typescript
import {Controller, Mutation} from "vesper";
import {EntityManager} from "typeorm";
import {User} from "../entity/User";
import {UserSaveArgs} from "../args/UserSaveArgs";
import {PasswordEncryptor} from "../service/PasswordEncryptor";

@Controller()
export class UserController {
    
    constructor(private entityManager: EntityManager,
                private passwordEncryptor: PasswordEncryptor) {
    }

    @Mutation()
    userSave(args: UserSaveArgs) {
        const user = new User();
        user.password = this.passwordEncryptor.encrypt(args.password);
        return this.entityManager.save(user);
    }

}
```

Vesper uses [TypeDI](https://github.com/typestack/typedi) service container - a powerful dependency injection tool.
All your services are scoped by user request by default.

Repositories are services, just like controllers are resolvers are.
Repository - is a place where you should store your database queries. Here is an example of Repository:

```typescript
import {Service} from "typedi";
import {EntityManager, FindManyOptions} from "typeorm";
import {Post} from "../entity/Post";
import {PostsArgs} from "../args/PostsArgs";
import {PostSaveArgs} from "../args/PostSaveArgs";

@Service()
export class PostRepository {
    
    constructor(private entityManager: EntityManager) {
    }

    find(args: PostsArgs) {

        let findOptions: FindManyOptions = {};
        if (args.limit)
            findOptions.take = args.limit;
        if (args.offset)
            findOptions.skip = args.offset;
        if (args.sortBy === "last")
            findOptions.order = { "id": "DESC" };
        if (args.sortBy === "name")
            findOptions.order = { "name": "ASC" };

        return this.entityManager.find(Post, findOptions);
    }

    findById(id: number) {
        return this.entityManager.findOne(Post, id);
    }

    save(args: PostSaveArgs) {
        const post = new Post();
        post.id = args.id;
        post.title = args.title;
        post.text = args.text;
        return this.entityManager.save(post);
    }

    remove(id: number) {
        return this.entityManager.remove(Post, { id: id });
    }

}
```

Best practice is to store your entities inside `repository` directory.
To learn more about entity repositories refer to [TypeORM documentation](http://typeorm.io/#/custom-repository).