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

Let's create `src/args/PostsArgs.ts` interface:

```typescript
export interface PostsArgs {
    limit?: number;
    offset?: number;
    sortBy?: string;
}
```

Args are being passed as a first parameter in your controller action:

```typescript
import {Controller, Query} from "graphstack";
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

And make sure to add entity in app bootstrap file (`src/index.ts`):

```typescript
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

Before creating a new resolver add `categoryNames: string[]` property to your `Post` entity.

Create `src/resolver/PostResolver.ts` file and put following content:

```typescript
import {Resolver, Resolve, ResolverInterface} from "graphstack";
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
{
        // ...
    controllers: [
        // ...
    ],
    resolvers: [
        PostResolver
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

Let's change our `PostResolver.ts` file:

```typescript
import {Resolve, Resolver, ResolverInterface} from "graphstack";
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

And don't forget to register this resolver:

```typescript
{
    // ...
    controllers: [
        // ...
    ],
    resolvers: [
        PostResolver
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
Let's create a `TextGenerator` class in a `src/service/TextGenerator.ts` file:


```typescript
import {Service} from "typedi";

@Service()
export class TextGenerator {

    generate() {
        // here you can generate text for your posts using any faker data library
        return "";
    }

}
```

Then you can inject this service in any controller, resolver or other service using constructor:

```typescript
import {Controller} from "graphstack";
import {TextGenerator} from "../service/TextGenerator";

@Controller()
export class PostController {

    constructor(private textGenerator: TextGenerator) {
    }
    
    // ...
    
}
```

Controllers and resolvers are services as well. 
All services has a request-scope by default.

### Validating input arguments

All user input must be validated. 
GraphStack provides you a way to validate all user input (args) elegant way.
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
import {Controller, Query, ArgsValidator} from "graphstack";
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

Validators are regular services and you can inject any other service using constructor injection.

Example repository for this sample is available [here](https://github.com/graphframework/typescript-advanced-example).