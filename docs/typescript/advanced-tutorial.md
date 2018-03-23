# Advanced Tutorial

> This guide is for TypeScript users. JavaScript version is [here](../javascript/advanced-tutorial.md).

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

Let's create a `src/args/PostsArgs.ts` interface:

```typescript
export interface PostsArgs {
    limit?: number;
    offset?: number;
    sortBy?: string;
}
```

Args are being passed as a first parameter in your controller action:

```typescript
import {Controller, Query} from "scepter";
import {EntityManager, FindManyOptions} from "typeorm";
import {PostsArgs} from "../args/PostsArgs";
import {Post} from "../entity/Post";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    posts(args: PostsArgs) {

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
    
    // ...
    
}
```

### Adding relations

Using TypeORM you can create one-to-one, one-to-many, many-to-one and many-to-many relations between your entities.
Scepter automatically resolves all your relations when you request them. 

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

Second, we need to create a new database model `src/entity/Category.ts`:

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

And change `src/entity/Post.ts` entity:

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

And make sure to register entity in app bootstrap file (`src/index.ts`):

```typescript
bootstrap({
    entities: [
        Post,
        Category
    ]
    // ...
});
```

Now you'll be able to query post categories and category posts without any extra code written!
Scepter and TypeORM does all the magic for you.

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

Scepter provides you an elegant way to create resolvers for your models.
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

First, add `categoryNames: string[]` property to your `Post` entity.
Then create a resolver class inside `src/resolver/PostResolver.ts` file:

```typescript
import {Resolver, Resolve, ResolverInterface} from "scepter";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";
import {Category} from "../entity/Category";

@Resolver(Post)
export class PostResolver implements ResolverInterface<Post> {

    constructor(private entityManager: EntityManager) {
    }

    @Resolve()
    categoryNames(post: Post) {
        return this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoin("category.posts", "post", "post.id = :postId", { postId: post.id })
            .getMany()
            .then(categories => categories.map(category => category.name));
    }

}
```

And register it in bootstrap file (`src/index.ts`):

```typescript
bootstrap({
    resolvers: [
        PostResolver
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
Scepter provides a powerful abstraction layer that prevents you to use it directly and reduce a boilerplate code.

Let's change our `PostResolver.ts` file:

```typescript
import {Resolve, Resolver, ResolverInterface} from "scepter";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";
import {Category} from "../entity/Category";

@Resolver(Post)
export class PostResolver implements ResolverInterface<Post> {

    constructor(private entityManager: EntityManager) {
    }

    @Resolve()
    async categoryNames(posts: Post[]) {
        const postIds = posts.map(post => post.id);
        const categories = await this.entityManager
            .createQueryBuilder(Category, "category")
            .innerJoinAndSelect("category.posts", "post", "post.id IN (:...postIds)", { postIds })
            .getMany();

        return posts.map(post => {
            return categories
                .filter(category => category.posts.some(categoryPost => categoryPost.id === post.id))
                .map(category => category.name);
        });
    }

}
```

As you can see now `categoryNames` accepts an array of all posts for which we need to resolve the data. 
This allowed us to return category names within a single database query.

### Using service container

Scepter provides you a [powerful service container](https://github.com/typestack/typedi) out of the box.
This allows you to structure your code a better way and easily unit-test your code.
Let's create a `TextGenerator` class in a `src/service/TextGenerator.ts` file:


```typescript
import {Service} from "typedi";

@Service()
export class TextGenerator {

    generate() {
        // here you can generate text for your posts 
        // using any faker data library
        return "";
    }

}
```

Then you can inject this service in any controller, resolver or other service using constructor:

```typescript
import {Controller} from "scepter";
import {TextGenerator} from "../service/TextGenerator";

@Controller()
export class PostController {

    constructor(private textGenerator: TextGenerator) {
    }
    
    // ...
    
}
```

Controllers and resolvers are services as well. 
All services have a request-scope by default.

### Validating input arguments

All user input must be validated. 
Scepter provides you a way to validate all user input (args) elegant way.
Create a `src/validator/PostsArgsValidator.ts` file with following contents:

```typescript
import {Service} from "typedi";
import {PostsArgs} from "../args/PostsArgs";

@Service()
export class PostsArgsValidator {
    
    validate(args: PostsArgs) {
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

```typescript
import {Controller, Query, ArgsValidator} from "scepter";
import {EntityManager, FindManyOptions} from "typeorm";
import {Post} from "../entity/Post";
import {PostsArgsValidator} from "../validator/PostsArgsValidator";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    @ArgsValidator(PostsArgsValidator)
    posts(args) {

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
    
    // ...
    
}
```

And controller args will be validated before controller method is executed.
Validators are regular services and you can inject any other service using constructor injection.

At this point you should already know a 90% of Scepter framework and you are ready to start creating amazing backends using it.
Example repository for this sample is available [here](https://github.com/graphframework/typescript-advanced-example).