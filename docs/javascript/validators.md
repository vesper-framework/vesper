# Validators

> This guide is for JavaScript users. TypeScript version is [here](../typescript/validators.md).

Any input data must be validated. 
In GraphQL input data is `args` and GraphStack provides you a way to validate `args` objects.

First, create a validator:

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

Second, register validator on a controller method where you want to validate `args`:

```javascript
{ controller: PostController, action: "posts", type: "query", validators: [PostsArgsValidator] }
```

You can also register it on a resolver method:

```javascript
{ resolver: PostResolver, model: Post, methods: [{ methodName: "categories", validators: [PostCategoryArgsValidator] }] }
```

Now, on each client request args on your `posts` query will be validated using `PostsArgsValidator` class.