# Advanced Tutorial

> This guide is for JavaScript users. TypeScript version is [here](../typescript/advanced-tutorial.md).

This guide extends [getting started](./getting-started.md) guide and 
teach you how to add relations and resolvers in your application.

* [Controller args](#controller-args)
* [Adding relations](#adding-relations)
* [Creating a Resolver](#creating-a-resolver)
* [Resolver and DataLoader](#resolver-and-dataloader)
* [Using service container](#using-service-container)
* [Validating input arguments](#validating-input-arguments)

### Controller args

For the following GraphQL query args:

```graphql
type Query {
    posts(limit: Int, offset: Int, sortBy: String): [Post]
}
```

Args are being passed as a first parameter in your controller action:

```javascript
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";

export class PostController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    // serves "posts: [Post]" requests
    // "args" variable will contain all arguments - limit, offset and sortBy
    posts(args) {

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
    
    // ...
    
}
```

### Adding relations

Using TypeORM you can create one-to-one, one-to-many, many-to-one and many-to-many relations between your entities.
Vesper automatically resolves all your relations when you request them.

Let's create a new model called `Category` and add a many-to-many relation between `Post` and `Category`.
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

And make sure to register entity in app bootstrap file (`src/index.js`):

```javascript
bootstrap({
    entities: [
        Post,
        Category
    ]
    // ...
});
```

Now you'll be able to query post categories and category posts without any extra code written!
Vesper and TypeORM does all the magic for you.

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

Vesper provides you an elegant way to create resolvers for your models.
Let's say you have `categoryNames` property in your `Post` schema:

```graphql
type Post {
    id: Int
    title: String
    text: String
    categories: [Category]
    categoryNames: [String]
}
```


Unlike `id`, `title` and `text` this property is not stored in your database, 
and its value needs to be resolved only when client actually requests this data.
It means we cannot simply set this property inside controller if its computation does affect performance.
Here, resolvers come into the play.

Create a resolver class inside `src/resolver/PostResolver.js` file:

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
bootstrap({
    resolvers: [
        { resolver: PostResolver, model: Post, methods: ["categoryNames"] },
    ],
    // ...
});
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

And code inside your resolver will be executed only when client requested `categoryNames` property.

### Resolver and DataLoader

In previous section we created a resolver that resolves `categoryNames` property.
Code inside `categoryNames` method will be executed as many times as many posts we load.
This can lead into performance issues if you have a costly operation inside your resolver method.
To address this issue GraphQL suggests to use [data-loader](https://github.com/facebook/dataloader) library.
Vesper provides a powerful abstraction layer that prevents you to use it directly and reduce a boilerplate code.

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
bootstrap({
    resolvers: [
        { resolver: PostResolver, model: Post, methods: [{ methodName: "categoryNames", many: true }] },
    ],
    // ...
});
```

As you can see now `categoryNames` accepts an array of all posts for which we need to resolve the data. 
This allowed us to return category names within a single database query.

### Using service container

Vesper provides you a [powerful service container](https://github.com/typestack/typedi) out of the box.
This allows you to structure your code a better way and easily unit-test your code.
Let's create a `TextGenerator` class in a `src/service/TextGenerator.js` file:

```javascript
export class TextGenerator {

    generate() {
        // here you can generate text for your posts 
        // using any faker data library
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
All services have a request-scope by default.

### Validating input arguments

All user input must be validated. 
Vesper provides you a way to validate all user input (args) elegant way.
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

And controller args will be validated before controller method is executed.
Validators are regular services and you can inject any other service using constructor injection.

At this point you should already know a 90% of Vesper framework and you are ready to start creating amazing backends using it.
Example repository for this sample is available [here](https://github.com/graphframework/javascript-advanced-example).