# Controllers and Args

> This guide is for TypeScript users. JavaScript version is [here](../javascript/controllers-and-args.md).

Controllers serve your root queries, mutations and subscriptions.

For the following Query:

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

You create following controller:

```typescript
import {Controller, Query, Mutation} from "graphstack";

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
        // serves "postSave(id: Int, title: String, text: String): Post" requests
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

Next, you must register controller inside bootstrap file:

```typescript
bootstrap({
    controllers: [
        PostController
    ],
    // ...
});
```

Note, query/mutation/subscription name matches controller method name.
If in some cases you'll need to use different method name, you can specify it:

```typescript
@Query({ name: "posts" })
allPosts() {
    // serves "posts: [Post]" requests
    // return posts
}
```

But best practice is to have same controller method name and query/mutation name.
Use different method name only when you really need it.

Controller methods accepts 3 parameters: `args`, `context` and `info`.
`args` contains all arguments sent by a client.

To make your args type-safe you'll need to define its type, 
and its recommended to create an interface for this purpose and put it into `args` directory.
Its recommended to name each controller method args as "ActionNameArgs", 
for example for `postSave` method you can create `PostSaveArgs` interface in a `PostSaveArgs.ts` file:

```typescript
export interface PostSaveArgs {

    id?: number;
    title?: string;
    text?: string;

}
``` 

Best practice is to have a single interface per-file.

If you use TypeORM mutations are wrapped into transactions by default, you can disable this behaviour this way:

```typescript
@Mutation({ transaction: false })
postSave(args) {
    // serves "postSave(id: Int, title: String, text: String): Post" requests
    // save post and return it
}
```

Each controller is a service. It means you have a `container` instance and you can inject any service you have:

```typescript
export class PostController {

    constructor(private entityManager: EntityManager, 
                private someService: SomeService) {
    }
    
}
```

It also means that your controllers are easily testable.