# Controllers and Args

> This guide is for JavaScript users. TypeScript version is [here](../typescript/controllers-and-args.md).

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

```javascript
export class PostController {

    posts() {
        // serves "posts: [Post]" requests
        // return posts
    }
    
    post({ id }) {
        // serves "post(id: Int): Post" requests
        // return post by id
    }

    postSave(args) {
        // serves "postSave(id: Int, title: String, text: String): Post" requests
        // save post and return it
    }

    postDelete({ id }) {
        // serves "postDelete(id: Int): Boolean" requests
        // delete post by id 
    }
    
}
```

Best practice to structure your controllers - a single controller per model.

Next, you must register controller and all query/mutation/subscription methods inside bootstrap file:

```javascript
bootstrap({
    controllers: [
        { controller: PostController, action: "posts", type: "query" },
        { controller: PostController, action: "post", type: "query" },
        { controller: PostController, action: "postSave", type: "mutation" },
        { controller: PostController, action: "postDelete", type: "mutation" },
    ],
    // ...
});
```

Note, query/mutation/subscription name matches controller method name.
If in some cases you'll need to use different method name, you can specify it:

```javascript
{ controller: PostController, name: "posts", action: "allPosts", type: "query" }
```

But best practice is to have same controller method name and query/mutation name.
Use different method name only when you really need it.

Controller methods accepts 3 parameters: `args`, `context` and `info`.
`args` contains all arguments sent by a client.

If you use TypeORM mutations are wrapped into transactions by default, you can disable this behaviour this way:

```javascript
{ controller: PostController, action: "postSave", type: "mutation", transaction: false }
```

Each controller is a service. It means you have a `container` instance and you can inject any service you have:

```javascript
export class PostController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
        this.someService = container.get(SomeService);
    }
    
}
```

It also means that your controllers are easily testable.