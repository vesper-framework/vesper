# Validators

> This guide is for TypeScript users. JavaScript version is [here](../javascript/validators.md).

Any input data must be validated. 
In GraphQL all input data is exposed through `args` and Scepter provides you a way to validate `args` objects.

First, create a validator:

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

Second, register validator on a controller method where you want to validate `args`:

```typescript
import {Controller, Query, ArgsValidator, PostsArgsValidator} from "scepter";
import {PostsArgs} from "../entity/PostsArgs";
import {PostsArgsValidator} from "../validator/PostsArgsValidator";

@Controller()
export class PostController {

    @Query()
    @ArgsValidator(PostsArgsValidator)
    posts(args: PostsArgs) {
        // ...
    }
    
}
```

You can also register it on a resolver method:

```typescript
import {Resolver, Resolve, ResolverInterface, ArgsValidator} from "scepter";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";
import {Category} from "../entity/Category";
import {PostCategoryArgs} from "../args/PostCategoryArgs";
import {PostCategoryArgsValidator} from "../validator/PostCategoryArgsValidator";

@Resolver(Post)
export class PostResolver implements ResolverInterface<Post> {

    @Resolve()
    @ArgsValidator(PostCategoryArgsValidator)
    categories(posts: Post[], args: PostCategoryArgs) {
        // ...
    }

}
```