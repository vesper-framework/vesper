# Entity relations

> This guide is for TypeScript users. JavaScript version is [here](../javascript/entity-relations.md).

Let's say you have a `Post` model:

```graphql
type Post {
    id: Int
    title: String
    text: String
    categories: [Category]
}
```

and a `Category` model:

```graphql
type Category {
    id: Int
    name: String
    posts: [Post]
}
```

If you are using TypeORM then you define two entities - `Post` and `Category` and create a many-to-many relation between them:

```typescript
import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Category} from "./Category";

@Entity()
export class Post {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    text: string;

    @ManyToMany(() => Category, category => category.posts)
    @JoinTable()
    categories: Category[];

}
```

And:

```typescript
import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./Post";

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Post, post => post.categories)
    posts: Post[];

}
```

GraphStack provides an embedded entity relation resolver, 
so when you request posts with categories:

```graphql
query {
    posts {
        id
        title
        text
        categories {
            id
            name
        }
    }
}
```

or categories with posts:

```graphql
query {
    categories {
        id
        name
        posts {
            id
            title
            text
        }
    }
}
```

The data will be automatically resolved for you by GraphStack.

To learn more about entity relations refer to [TypeORM documentation](http://typeorm.io/#/relations).