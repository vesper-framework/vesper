## Advanced Tutorial

> This guide is for JavaScript users. TypeScript version is [here](../typescript/advanced-tutorial.md).

This guide extends [getting started](./getting-started.md) guide and 
teach you how to add relations and resolvers in your application.

* [Adding relations](#adding-relations)
* [Creating a Resolver](#creating-a-resolver)
* [Resolver and DataLoader](#resolver-and-data-loader)
* [Using service container](#using-service-container)
* [Validating input arguments](#validating-input-arguments)

### Adding relations

Let's add a new model called `Category` and create a many-to-many relation between `Post` and `Category`.
First, create a new `src/schemas/model/Category.graphql` schema file:

```graphql
type Category {
    id: Int
    name: String
    posts: [Post]
}
```

and change `src/schemas/model/Post.graphql` schema:

```graphql
type Post {
    id: Int
    title: String
    text: String
    categories: [Category]
}
```

Second, we need to create a new database model `src/entity/Category.js`:

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

And change `src/entity/Post.js` entity:

```javascript
import {EntitySchema} from "typeorm";

export const Category = new EntitySchema({
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

And make sure to add entity in app bootstrap file (`src/index.js`):

```javascript
// ...
    entities: [
        Post,
        Category
    ]
// ...
```

Now you'll be able to query post categories and category posts without any extra code written!
GraphStack and TypeORM does all the magic for you.

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

### Creating a Resolver

GraphStack provides you an elegant way to create resolvers for your models.
Let's say you have `categoryNames` in your `Post` schema:

```graphql
type Post {
    id: Int
    title: String
    text: String
    categories: [Category]
    categoryNames: [String]
}
```

You need to create a resolver class for your model.
Create `src/resolver/PostResolver.js` file and put following content:

```javascript
import {EntityManager} from "typeorm";
import {Category} from "../entity/Category";

export class PostResolver {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    categoryNames(post) {
        return this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoin("category.posts", "post", "post.id = :postId", { postId: post.id })
            .getMany()
            .then(categories => categories.map(category => category.name));
    }

}
```

And register it in bootstrap file (`src/index.js`):

```javascript
{
        // ...
    controllers: [
        // ...
    ],
    resolvers: [
        { resolver: PostResolver, model: Post, methods: ["categoryNames"] },
    ],
    entities: [
        // ...
    ],
    // ...
}
```

Now you'll able to request it:

```graphql
query {
    posts {
        id
        title
        text
        categoryNames
    }
}
```
### Resolver and DataLoader

In previous section we created resolver that resolves `categoryNames` property.
Code inside `categoryNames` method will be executed as many times as much posts we load each time.
To address this issue GraphQL suggests to use [data-loader](https://github.com/facebook/dataloader) library.
GraphStack provides a powerful abstraction layer that prevents you to use it directly and implement what you want - 
load `categoryNames` in a single request for all requested posts.

Let's change our `PostResolver.js` file:

```javascript
import {EntityManager} from "typeorm";
import {Category} from "../entity/Category";

export class PostResolver {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    categoryNames(posts) {
        const postIds = posts.map(post => post.id);
        return this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoinAndSelect("category.posts", "post", "post.id IN (:...postIds)", { postIds })
            .getMany()
            .then(categories => {
                return posts.map(post => {
                    return categories
                        .filter(category => category.posts.some(categoryPost => categoryPost.id === post.id))
                        .map(category => category.name);
                });
            });
    }

}
```

And register this resolver method with `many: true` flag set:

```javascript
{
    // ...
    controllers: [
        // ...
    ],
    resolvers: [
        { resolver: PostResolver, model: Post, methods: [{ methodName: "categoryNames", many: true }] },
    ],
    entities: [
        // ...
    ],
    // ...
}
```

Now `categoryNames` accepts an array of all posts and you can get all category names in a single database query.

### Using service container

GraphStack provides you a [powerful service container](https://github.com/typestack/typedi) out of the box.
This allows you to structure your code a better way and allows to easily unit-test your code.
Let's create a `TextGenerator` class in a `src/service/TextGenerator.js` file:


```javascript
export class TextGenerator {

    generate() {
        // here you can generate text for your posts using any faker data library
        return "";
    }

}
```

Then you can inject this service in any controller, resolver or other service using constructor:

```javascript
import {TextGenerator} from "../service/TextGenerator";

export class PostController {

    constructor(container) {
        this.textGenerator = container.get(TextGenerator);
    }
    
    // ...
    
}
```

Controllers and resolvers are services as well. 
All services has a request-scope by default.

### Validating input arguments

All user input must be validated. 
GraphStack provides you a way to validate all user input (args) elegant way.
Create a `src/validator/PostArgsValidator.js` file with following contents:

```javascript
export class PostsArgsValidator {
    
    validate(args) {
       if (args.limit !== undefined && args.limit > 100)
           throw new Error(`Limit cannot be more then 100.`);
    
       if (args.limit !== undefined && args.limit < 1)
           throw new Error(`Limit cannot be less then 1.`);
    
       if (args.offset !== undefined && args.offset < 0)
           throw new Error(`Offset cannot be less then zero.`);
    
       if (args.sortBy && args.sortBy !== "name" && args.sortBy !== "last")
           throw new Error(`Sort can only be by name or by last`);
    }

}
```

Then you need to register validator for action you need:

```javascript
// ...
    controllers: [
        { controller: PostController, action: "posts", type: "query", validators: [PostsArgsValidator] },
    ]
// ...
```

Validators are regular services and you can inject any other service using constructor injection.

Example repository for this sample is available [here](https://github.com/graphframework/javascript-advanced-example).