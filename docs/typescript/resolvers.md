# Resolvers

> This guide is for TypeScript users. JavaScript version is [here](../javascript/resolvers.md).

Model data can be resolved using `Resolver` classes. 
Let's say you have a following model:

```graphql
type Post {
    id: Int
    title: String
    text: String
    categoryNames: [String]
}
```

And you have a following controller:

```typescript
import {Controller, Query} from "graphstack";
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
    
}
```

Here, `posts` returns you post's id, title and text.
To additionally return `categoryNames` you need to load all post's categories and set them to post before returning them,
like this: 

```typescript
import {Controller, Query} from "graphstack";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";
import {Category} from "../entity/Category";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    async posts() {
        const posts = await this.entityManager.find(Post);
        await Promise.all(posts.map(async post => {
            const categories = await this.entityManager
                .createQueryBuilder(Category, "category")
                .innerJoin("category.posts", "post", "post.id = :postId", { postId: post.id })
                .getMany();
            post.categoryNames = categories.map(category => category.name);
        }));
        return posts;
    }
    
}
```

But such approach is absolutely wrong! This query will be executed each time your posts are loaded, 
even if client did not request `categoryNames` at all. 
But what is solution then? 
Solution is to revert controller back to its original form and create a separate `Resolver` class:

```typescript
import {Resolver, ResolverInterface, Resolve} from "graphstack";
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

Then you'll need to register resolver inside bootstrap file:

```typescript
bootstrap({
    resolvers: [
        PostResolver
    ],
    // ...
});
```

Now `categoryNames` method will be executed only when client will request post's categoryNames.

Code inside `categoryNames` method will be executed as many times as much posts we load each time.
To address this issue GraphQL suggests to use [data-loader](https://github.com/facebook/dataloader) library.
GraphStack provides a powerful abstraction layer that prevents you to use it directly and implement what you want - 
load `categoryNames` in a single request for all requested posts.

Let's change our `PostResolver` class:

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
    categoryNames(posts: Post[]) {
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

Now `categoryNames` accepts an array of all posts and you can get all category names in a single database query.

Resolvers accept `args`, `context` and `info` parameters just like controllers do:

```typescript
categoryNames(posts, args, context, info) {
    // ...
}
```

You can use validation and authorization features of GraphStack just like you can use them on controllers.