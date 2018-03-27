# Modules

> This guide is for TypeScript users. JavaScript version is [here](../javascript/modules.md).

Once your project gets larger having everything in a single `src` directory may create a big mess for you.
Vesper provides you an abstraction called `module` to separate your different parts of your application into modules.

Let's create a `User` and `Photo` modules. 
Create `src/user` and `src/photo` directories.
Each directory must have its own entities, modules, controllers, schemas, etc.
Each module must have its own "module" file.

Create a `UserModule` class inside `src/user/UserModule.ts` file:

```typescript
export class UserModule implements GraphModule {

    schemas = [
        __dirname + "/schema/**/*.graphql"
    ];

    controllers = [
        UserController
    ];

    entities = [
        User
    ];

    resolvers = [
        UserResolver
    ];

}
```

Create a `PhotoModule` class inside `src/photo/PhotoModule.ts` file:

```typescript
export class PhotoModule implements GraphModule {

    schemas = [
        __dirname + "/schema/**/*.graphql"
    ];

    controllers = [
        PhotoController
    ];

    entities = [
        Photo
    ];

    resolvers = [
        PhotoResolver
    ];

}
```

Then in bootstrap file register those modules:

```typescript
bootstrap({
    port: 3000,
    modules: [
        PhotoModule,
        PostModule,
    ]
});
```

That's it. Now your bootstrap file is simple, and everything single module-related in its directory.

See [here](../../sample/typescript/sample9-modules) a real example how to use modules.