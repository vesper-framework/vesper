# Modules

> This guide is for JavaScript users. TypeScript version is [here](../typescript/modules.md).

Once your project gets larger having everything in a single `src` directory may create a big mess for you.
Scepter provides you an abstraction called `module` to separate your different parts of your application into modules.

Let's create a `User` and `Photo` modules. 
Create `src/user` and `src/photo` directories.
Each directory must have its own entities, modules, controllers, schemas, etc.
Each module must have its own "module" file.

Create a `UserModule` class inside `src/user/UserModule.ts` file:

```javascript
export class UserModule {

    constructor() {
        this.schemas = [
            __dirname + "/schema/**/*.graphql"
        ];
        this.controllers = [
            { controller: UserController, action: "users", type: "query" },
            { controller: UserController, action: "user", type: "query" },
            { controller: UserController, action: "userSave", type: "mutation" },
            { controller: UserController, action: "userDelete", type: "mutation" },
            // ...
        ];
        this.entities = [
            User
            // ...
        ];
        this.resolvers = [
            // ...
        ];
    }

}
```

Create a `PhotoModule` class inside `src/photo/PhotoModule.ts` file:

```javascript
export class PhotoModule {

    constructor() {
        this.schemas = [
            __dirname + "/schema/**/*.graphql"
        ];
        this.controllers = [
            { controller: PhotoController, action: "photos", type: "query" },
            { controller: PhotoController, action: "photo", type: "query" },
            { controller: PhotoController, action: "photoSave", type: "mutation" },
            { controller: PhotoController, action: "photoDelete", type: "mutation" },
        ];
        this.entities = [
            Photo
            // ...
        ];
        this.resolvers = [
            // ...
        ];
    }

}
```

Then in bootstrap file register those modules:

```javascript
bootstrap({
    port: 3000,
    modules: [
        PhotoModule,
        PostModule,
    ]
});
```

That's it. Now your bootstrap file is simple, and everything single module-related in its directory.

See [here](../../sample/javascript/sample9-modules) a real example how to use modules.