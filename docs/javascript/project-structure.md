# Project Structure

> This guide is for JavaScript users. TypeScript version is [here](../typescript/project-structure.md).

Project structure can be different, depend on your needs and project scale.
This guide shows some basic project structures you can follow for different project scales.

## Small project

Following project structure is recommended for small apps:

```
├── src                 // your app source code
│   ├── args                // controller and resolver arguments
│   ├── controller          // controllers for your root queries
│   ├── entity              // database models called entities
│   ├── manager             // "manager" services - place for complicated business model logic
│   ├── model               // model classes
│   ├── repository          // "repository" services - place for database queries
│   ├── resolver            // your model and entity resolvers
│   ├── schema              // graphql schema files stored in ".graphql" format
│   │   ├── controller          // schemas for root queries, mutations and subscriptions
│   │   ├── input               // schemas for input files
│   │   └── model               // schemas for models and entities
│   ├── service             // services - place for logic extracted out of other classes
│   ├── validator           // args and user input validation logic
│   └── index.ts            // bootstrap file
│   
├── test                // unit, functional, e2e and other tests
├── config.json         // application configuration used in source code
├── ormconfig.json      // TypeORM connection configuration
├── package.json        // project dependencies
├── tsconfig.json       // TypeScript compiler configuration file
└── tslint.json         // TsLint file
```

## Large project

Following project structure is recommended for large apps:

```
├── src                 // your app source code
│   ├── module1             // module name (for example "user")
│   │   ├── args                // controller and resolver arguments
│   │   ├── controller          // controllers for your root queries
│   │   ├── entity              // database models called entities
│   │   ├── manager             // "manager" services - place for complicated business model logic
│   │   ├── model               // model classes
│   │   ├── repository          // "repository" services - place for database queries
│   │   ├── resolver            // your model and entity resolvers
│   │   ├── schema              // graphql schema files stored in ".graphql" format
│   │   │   ├── controller          // schemas for root queries, mutations and subscriptions
│   │   │   ├── input               // schemas for input files
│   │   │   └── model               // schemas for models and entities
│   │   ├── service             // services - place for logic extracted out of other classes
│   │   ├── validator           // args and user input validation logic
│   │   └── index.ts            // bootstrap file
│   │
│   ├── module2             // module name (for example "photo")
│   │   ├── args                // controller and resolver arguments
│   │   ├── controller          // controllers for your root queries
│   │   ├── entity              // database models called entities
│   │   ├── manager             // "manager" services - place for complicated business model logic
│   │   ├── model               // model classes
│   │   ├── repository          // "repository" services - place for database queries
│   │   ├── resolver            // your model and entity resolvers
│   │   ├── schema              // graphql schema files stored in ".graphql" format
│   │   │   ├── controller          // schemas for root queries, mutations and subscriptions
│   │   │   ├── input               // schemas for input files
│   │   │   └── model               // schemas for models and entities
│   │   ├── service             // services - place for logic extracted out of other classes
│   │   ├── validator           // args and user input validation logic
│   │   └── index.ts            // bootstrap file
│   │
│   └──  ...                 // other modules
│
├── test                // unit, functional, e2e and other tests
├── config.json         // application configuration used in source code
├── ormconfig.json      // TypeORM connection configuration
├── package.json        // project dependencies
├── tsconfig.json       // TypeScript compiler configuration file
└── tslint.json         // TsLint file
```

## Client + server project

In the case if you want to have backend and frontend in a same project, with shared code, 
you can follow this directory structure:

```
├── client                  
│   ├── src                 // your client-side app source code
│   └── ...                 // other client-side files and directories
│
├── server
│   ├── src                 // your server-side app source code
│   │   ├── args                // controller and resolver arguments
│   │   ├── controller          // controllers for your root queries
│   │   ├── entity              // database models called entities
│   │   ├── manager             // "manager" services - place for complicated business model logic
│   │   ├── model               // model classes
│   │   ├── repository          // "repository" services - place for database queries
│   │   ├── resolver            // your model and entity resolvers
│   │   ├── schema              // graphql schema files stored in ".graphql" format
│   │   │   ├── controller          // schemas for root queries, mutations and subscriptions
│   │   │   ├── input               // schemas for input files
│   │   │   └── model               // schemas for models and entities
│   │   ├── service             // services - place for logic extracted out of other classes
│   │   ├── validator           // args and user input validation logic
│   │   └── index.ts            // bootstrap file
│   │   
│   ├── test                // unit, functional, e2e and other tests
│   ├── config.json         // application configuration used in source code
│   ├── ormconfig.json      // TypeORM connection configuration
│   ├── package.json        // project dependencies
│   ├── tsconfig.json       // TypeScript compiler configuration file
│   └── tslint.json         // TsLint file
│
└── shared                  // shared interfaces, classes and other code
    ├── args                    // args interfaces can be there
    ├── model                   // model interfaces can be there
    └── ...                     // other code you want to shared between client and server

```

## Naming conventions

Let's say you have a `photo` module. 

### Model

Any module start with **model**.
Model must be inside `model` directory inside your `src` or module directory.
Follow this naming convention for your models:

* `Photo.js` inside `model` or `entity` directories
* `Album.js` inside `model` or `entity` directories

Follow best practices and use a single file for a single model. Example:

```javascript
// model/Photo.js
export class Photo {
    // ...
}

// model/Album.js
export class Album {
    // ...
}
```

### Controller

Use a single controller for a single model you have:

* `PhotoController.js` inside `controller` directory
* `AlbumController.js` inside `controller` directory

Example:

```javascript
// controller/PhotoController.js
export class PhotoController {
    // ...
}

// controller/AlbumController.js
export class AlbumController {
    // ...
}
```

### GraphQL schema

For most of your models and controllers you'll likely have a GraphQL schema.
Create a separate GraphQL schema for each of your model and controller:

* `Photo.graphql` inside `schema/model` directory
* `Album.graphql` inside `schema/model` directory
* `PhotoController.graphql` inside `schema/controller` directory
* `AlbumController.graphql` inside `schema/controller` directory

Example:

```graphql
# schema/model/Photo.graphql
type Photo {
    # ...
}

# schema/model/Album.graphql
type Album {
    # ...
}

# schema/controller/PhotoController.graphql
type PhotoController {
    # ...
}

# schema/controller/AlbumController.graphql
type AlbumController {
    # ...
}
```
