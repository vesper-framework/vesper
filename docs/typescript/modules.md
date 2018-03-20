# Modules

> This guide is for TypeScript users. JavaScript version is [here](../javascript/modules.md).

Once your project gets larger having everything in a single `src` directory may create a big mess for you.
GraphStack provides you an abstraction called `module` to separate your different parts of business logic into modules.

Let's create a `User` and `Photo` modules. 
Create `src/user` and `src/photo` directories.
Each directory must have its own entities, modules, controllers, schemas, etc.
Each module must have its own "module" file.

Create `src/user/UserModule.js` and put following contents:

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

And create `src/photo/PhotoModule.js` and put following contents:

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