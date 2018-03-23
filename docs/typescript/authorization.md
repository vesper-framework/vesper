# Authorization

> This guide is for TypeScript users. JavaScript version is [here](../javascript/authorization.md).

Scepter provides you an abstract way on how you define your currently authorized user.

Create some class that you'll use as currently authorized user, for example `CurrentUser`:

```typescript
export class CurrentUser {
    
    id: number;
    name: string;
    
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    
}
```

Then, you'll need to configure service container in bootstrap file:

```typescript
bootstrap({
    setupContainer: async (container, action) => {
        // trivial implementation, used for demonstration purpose
        const request = action.request; // user request, you can get http headers from it
        const entityManager = getManager();
        const user = entityManager.findOneOrFail(User, { token: request.headers.token });
        const currentUser = new CurrentUser(user.id, user.firstName + " " + user.lastName);
        container.set(CurrentUser, currentUser);
    },
    // ...
});
```

That's it. Now we can use `CurrentUser` via service container anywhere in your scoped services:

```typescript
export class PostController {

    constructor(private currentUser: CurrentUser) {
    }

}
```
