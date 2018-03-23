# Models and entities

> This guide is for TypeScript users. JavaScript version is [here](../javascript/models-and-entities.md).

Each GraphQL type defined this way:

```graphql
type Post {
    id: Int
    title: String
    text: String
}
```

Is called a "model". For such models you usualy define an interface or class inside `model` directory:

```typescript
export interface Post {
    id: number;
    title: string;
    text: string;
}
```

Model, that you want to store in the database is called "entity".
For example, for this particular `Post` model you can define an entity:

```typescript
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Post {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;
    
    @Column()
    text: string;
    
}
```

and TypeORM will create you a following table:

```shell
+-------------+--------------+----------------------------+
|                          post                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| title       | varchar(255) |                            |
| text        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

Then you'll be able to load / save / delete posts from your database this way:

```typescript
import {Controller, Query, Mutation} from "scepter";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    posts() {
        return this.entityManager.find(Post);
    }

    @Query()
    post({ id }) {
        return this.entityManager.findOne(Post, id);
    }

    @Mutation()
    postSave(args) {
        const post = this.entityManager.create(Post, args);
        return this.entityManager.save(Post, post);
    }

    @Mutation()
    async postDelete({ id }) {
        await this.entityManager.remove(Post, { id: id });
        return true;
    }

}
```

Best practice is to store your entities inside `entity` directory.
To learn more about entities refer to [TypeORM documentation](http://typeorm.io).