# Authorization

> This guide is for JavaScript users. TypeScript version is [here](../typescript/authorization.md).

GraphStack provides you an abstract way on how you define your currently authorized user.

Create some class that you'll use as currently authorized user, for example `CurrentUser`:

```javascript
export class CurrentUser {
    
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    
}
```

Then, you'll need to configure service container in bootstrap file:

```javascript
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

```javascript
export class PostController {

    constructor(container) {
        this.currentUser = container.get(CurrentUser);
    }

}
```
