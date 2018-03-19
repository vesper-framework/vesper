# Entity relations

> This guide is for JavaScript users. TypeScript version is [here](../typescript/entity-relations.md).

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
    },
    relations: {
        categories: {
            type: "many-to-many",
            joinTable: true,
            target: "Category",
            inverseSide: "posts"
        }
    }
});
```

And:

```javascript
import {EntitySchema} from "typeorm";

export const Category = new EntitySchema({
    name: "Category",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        name: {
            type: String
        }
    },
    relations: {
        posts: {
            type: "many-to-many",
            target: "Post",
            inverseSide: "categories"
        }
    }
});
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