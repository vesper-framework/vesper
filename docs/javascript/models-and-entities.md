# Models and entities

> This guide is for JavaScript users. TypeScript version is [here](../typescript/models-and-entities.md).

Each GraphQL type defined this way:

```graphql
type Post {
    id: Int
    title: String
    text: String
}
```

Is called a "model".

Model, that you want to store in the database is called "entity".
For example, for this particular `Post` model you can define entity this way:

```javascript
import {EntitySchema} from "typeorm";

export const Post = new EntitySchema({
    name: "Post",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        title: {
            type: String
        },
        text: {
            type: String
        }
    }
});
```

and TypeORM will create you a following table:

```shell
+-------------+--------------+----------------------------+
|                          post                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| title       | varchar(255) |                            |
| filename    | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

Then you'll be able to load/save/delete posts from your database this way:

```javascript
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";

export class PostController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    posts() {
        return this.entityManager.find(Post);
    }

    post({ id }) {
        return this.entityManager.findOne(Post, id);
    }

    postSave(args) {
        const post = this.entityManager.create(Post, args);
        return this.entityManager.save(Post, post);
    }

    postDelete({ id }) {
        return this.entityManager
            .remove({ id: id })
            .then(() => true);
    }

}
```

Best practice is to store your entities inside `entity` directory.
To learn more about entities refer to [TypeORM documentation](http://typeorm.io).