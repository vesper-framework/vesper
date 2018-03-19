## Getting Started

> This guide is for TypeScript users. JavaScript version is [here](../javascript/getting-started.md).

This guide will teach you how to create a simple CRUD application using GraphStack.
Let's say we want to create a "post" application, where users can create / read / update and delete posts.

* [Initial setup](#initial-setup)
* [Define GraphQL schema](#define-graphql-schema)
* [Define a Database Model](#define-a-database-model)
* [Creating a Controller](#creating-a-controller)
* [Running application](#running-application)

### Initial setup

Create a directory for the new project, create package.json inside (you can use `npm init` command) and install GraphStack:

```
npm i graphstack --save
```

In this tutorial we'll use `sqlite` database, so install it as well:

```
npm i sqlite3 --save
```

You can use any other database TypeORM supports, just follow [TypeORM documentation](http://typeorm.io).

Then create `src` directory, it will be our main working directory.

### Define GraphQL schema

First we create a `schema` directory inside `src` directory. 
To keep a clean structure let's separate our root queries and models inside different directories.
So, create `controller` and `model` directories inside `schema` directory:

```
- src/
    - schema/
        - controller/
        - model/
```

With following structure we'll be able to create directories for other types as well (inputs, categorized models) in the future.

`controller` directory will contain your root queries and mutations, and `model` directory will contain your models. 
Let's create a model first inside `schema/model/Post.graphql` file:

```graphql
type Post {
    id: Int
    title: String
    text: String
}
```

Defining GraphQL schemas inside `.graphql` files allows us to have them organized and easy to work with. 
If `.graphql` format is not recognizable by your IDE then install a plugin if its available for your IDE.
Now let's create a controller for our root queries inside `schema/controller/PostController.graphql` file:

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

Here, we added 4 root queries - 

* `posts: [Post]` - returns us all posts we have
* `post(id: Int): Post` - returns us a single post by a requested post id
* `postSave(id: Int, title: String, text: String): Post` - inserts a new post or updates exist post
* `postDelete(id: Int): Boolean` - deletes post by requested post id

Our schemas are ready. Now let's provide implementation for them.

### Define a Database Model

Our implementation starts with our database model `Post`. 
Let's create a `Post` [entity](http://typeorm.io/#/entities) inside `src/entity/Post.ts`:

```typescript
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Post {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;
    
    @Column()
    text: string;
    
}
```

As you can see we defined a `Post` entity with three columns - `id`, `title` and `text`. 
TypeORM will create following table for us:

```shell
+-------------+--------------+----------------------------+
|                          post                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| title       | varchar(255) |                            |
| filename    | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

To learn more about entities refer to [TypeORM documentation](http://typeorm.io).

Now we'll be able to store our data in the database.
Let's move to actual logic that will save and get this data from the database.

### Creating a Controller

Previously we added 4 root GraphQL queries:

* `posts: [Post]`
* `post(id: Int): Post`
* `postSave(id: Int, title: String, text: String): Post`
* `postDelete(id: Int): Boolean`

Logic that will handle those queries must be inside controllers.
Create a `src/controller/PostController.ts` file:

```typescript
import {Controller, Query, Mutation} from "graphstack";
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";

@Controller()
export class PostController {

    constructor(private entityManager: EntityManager) {
    }

    // serves "posts: [Post]" requests
    @Query()
    posts() {
        return this.entityManager.find(Post);
    }

    // serves "post(id: Int): Post" requests
    @Query()
    post({ id }) {
        return this.entityManager.findOne(Post, id);
    }

    // serves "postSave(id: Int, title: String, text: String): Post" requests
    @Mutation()
    postSave(args) {
        const post = this.entityManager.create(Post, args);
        return this.entityManager.save(Post, post);
    }

    // serves "postDelete(id: Int): Boolean" requests
    @Mutation()
    async postDelete({ id }) {
        await this.entityManager.remove({ id: id });
        return true;
    }

}
```

`entityManager` is used to work with database. 
Learn more about it in [TypeORM documentation](http://typeorm.io/#/working-with-entity-manager).

That's it! We have a controller that does what we need - it get us all posts, 
get a single post by id, saves and removes posts.

Now we need to create a configuration and bootstrap files that allow us to run all this magic. 

### Running application

To use TypeORM you need to create `ormconfig.json` in the root of your application:

````
src/
    ...
ormconfig.json
package.json
````

And put following configuration:

```json
{
  "type": "sqlite",
  "database": "database.sqlite",
  "synchronize": true
}
```

This will tell TypeORM to use SQLite database and store your data inside `./database.sqlite` file.
Learn more about `ormconfig` in [TypeORM documentation](http://typeorm.io/#/using-ormconfig).

Now we only need to bootstrap our GraphStack application. Let's create a `src/index.ts` file:

```typescript
import {bootstrap} from "graphstack";
import {PostController} from "./controller/PostController"; 
import {Post} from "./entity/Post"; 

bootstrap({
    port: 3000,
    controllers: [
        PostController
    ],
    entities: [
        Post
    ],
    schemas: [__dirname + "/schema/**/*.graphql"]
}).then(() => {
    console.log("Your app is up and running on http://localhost:3000. " +
                "You can use playground in development mode on http://localhost:3000/playground");
    
}).catch(error => {
    console.error(error.stack ? error.stack : error);
});
```

Here we told our app to run on `3000` port and we registered our controller, entity and GraphQL schemas.
Now its time to compile our application and run it.
Create a `tsconfig.json` file and put following configuration:

```json
{
    "compilerOptions": {
        "lib": ["es6", "es7", "esnext"],
        "module": "commonjs",
        "moduleResolution": "node",
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "sourceMap": true
    }
}
```

Then compile and run our application:

```
tsc && node ./src/index.js
```

If you don't have `tsc` available then simply install typescript compiler (`npm i typescript -g`).

That's it, your app is ready! 
GraphStack provides you [GraphQL Playground](https://github.com/graphcool/graphql-playground) out of the box in the development mode, you can access it via:

```
http://localhost:3000/playground
```

Run following queries to test your new GraphQL API:

#### Query all posts

```graphql
query {
  posts {
    id
    title
  }
}
```

#### Query post by id

```graphql
query {
  post(id: 1) {
    id
    title
  }
}
```

#### Insert a new post

```graphql
mutation {
  postSave(title: "First post", text: "about first post") {
    id
    title
    text
  }
}
```

#### Update exist post

```graphql
mutation {
  postSave(id: 1, title: "First post", text: "about first post") {
    id
    title
    text
  }
}
```

#### Delete post

```graphql
mutation {
  postDelete(id: 1)
}
```

Now you are ready to read a more [advanced tutorial](./advanced-tutorial.md).

Example repository for this sample is available [here](https://github.com/graphframework/typescript-simple-example).