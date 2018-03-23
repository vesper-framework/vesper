# Controllers and Args

> This guide is for TypeScript users. JavaScript version is [here](../javascript/controllers-and-args.md).

Controllers serve your root queries, mutations and subscriptions.

For the following Query and Mutation:

```graphql
type Query {
    posts: [Post]
    post(id: Int): Post
}

type Mutation {
    postSave(id: Int, title: String, text: String): Post
    postDelete(id: Int): Boolean
}
```

You create a following controller:

```typescript
import {Controller, Query, Mutation} from "scepter";

@Controller()
export class PostController {

    @Query()
    posts() {
        // serves "posts: [Post]" requests
        // return posts
    }
    
    @Query()
    post({ id }) {
        // serves "post(id: Int): Post" requests
        // return post by id
    }

    @Mutation()
    postSave(args) {
        // serves "postSave(id: Int, title: String, text: String): Post"
        // save post and return it
    }

    @Mutation()
    postDelete({ id }) {
        // serves "postDelete(id: Int): Boolean" requests
        // delete post by id 
    }
    
}
```

Best practice to structure your controllers - a single controller per model.

To activate controller you must register it inside bootstrap file:

```typescript
bootstrap({
    controllers: [
        PostController
    ],
    // ...
});
```

Note, query / mutation / subscription name matches controller method name.
If for some reason you'll need to use different method name, you can specify query name:

```typescript
@Query({ name: "posts" })
allPosts() {
    // serves "posts: [Post]" requests
    // return posts
}
```

But best practice is to have same controller method name and query/mutation name.
Use different method name only when you really need it.

Controller methods accepts 3 parameters: `args`, `context` and `info`:

* `args` contains all arguments sent by a client
* `context` is used to share some state in context of a single request
* `info` contains GraphQL query information

To make your args type-safe you'll need to define its type, 
and its recommended to create an interface for this purpose and put it into `args` directory.
Its recommended to name each controller method args as "QueryNameArgs", 
for example for `postSave` method you can create `PostSaveArgs` interface in a `PostSaveArgs.ts` file:

```typescript
export interface PostSaveArgs {

    id?: number;
    title?: string;
    text?: string;

}
```

If you use TypeORM, all mutations are wrapped into transactions.
You can disable this behaviour this way:

```typescript
@Mutation({ transaction: false })
postSave(args) {
    // serves "postSave(id: Int, title: String, text: String): Post" requests
    // save post and return it
}
```

Each controller is a service. 
It means you can inject any service using dependency injection framework:

```typescript
export class PostController {

    constructor(private entityManager: EntityManager, 
                private someService: SomeService) {
    }
    
}
```

It also means your controllers are easily testable.