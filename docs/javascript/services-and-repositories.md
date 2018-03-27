# Services and Repositories

> This guide is for JavaScript users. TypeScript version is [here](../typescript/services-and-repositories.md).

All your application logic that is not directly related to controllers or resolvers 
can be extracted into separate classes called "services".
Services can be grouped by types, 
for example you can create "repository" services that will have a database queries,
you can create "manager" services that manage some business logic,
you can create "utility" services with utility functions.

Services allow you to keep your code clean and follow separation of concerns principle.
Here is an example how to create a simple service:

```javascript
export class PasswordEncryptor {

    encrypt(password) {
        // ... do password encryption ...
        return password;
    }

}
```

Then you can use it in any other service (including controllers, resolvers, validators, etc.):

```javascript
import {EntityManager} from "typeorm";
import {User} from "../entity/User";
import {PasswordEncryptor} from "../service/PasswordEncryptor";

export class UserController {
    
    constructor(container) {
        this.entityManager = container.get(EntityManager);
        this.passwordEncryptor = container.get(PasswordEncryptor);
    }

    userSave(args) {
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

```javascript
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";

export class PostRepository {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    find(args) {

        let findOptions = {};
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

    findById(id) {
        return this.entityManager.findOne(Post, id);
    }

    save(args) {
        return this.entityManager.save({
           id: args.id,
           title: args.title,
           text: args.text
       });
    }

    async remove(id) {
        await this.entityManager.remove(Post, { id: id });
        return true;
    }

}
```


Best practice is to store your entities inside `repository` directory.
To learn more about entity repositories refer to [TypeORM documentation](http://typeorm.io/#/custom-repository).