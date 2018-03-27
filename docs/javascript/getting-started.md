# Getting Started

> This guide is for JavaScript users. TypeScript version is [here](../typescript/getting-started.md).

This guide will teach you how to create a simple CRUD application using Vesper.
We will create a "post" application, where users can create / read / update and delete posts.

* [Initial setup](#initial-setup)
* [Define  a GraphQL schema](#define-a-graphql-schema)
* [Define a Database Model](#define-a-database-model)
* [Creating a Controller](#creating-a-controller)
* [Running application](#running-application)
* [Working with application](#working-with-application)

### Initial setup

Create a directory for the new project with a package.json inside (you can use `npm init`) and install Vesper:

```
npm i vesper --save
```

In this tutorial we will use `sqlite` database, so install it as well:

```
npm i sqlite3 --save
```

You can use any other database TypeORM supports,
just follow [TypeORM documentation](http://typeorm.io) on how to setup them.

Finally create `src` directory, it will be our main working directory.

### Define a GraphQL schema

Create a `schema` directory inside `src` directory. 
To keep a clean structure lets separate our root queries and models by different directories - 
inside `controller` and `model`:

```
└── src
    └── schema
        ├── controller
        └── model
```

With following structure we'll be able to create directories for other types as well (inputs, categorized models) in the future.

`controller` directory will contain your root queries and mutations, and `model` directory will contain your models. 
Let's create a "Post" model inside `schema/model/Post.graphql` file:

```graphql
type Post {
    id: Int
    title: String
    text: String
}
```

Defining GraphQL schemas inside `.graphql` files allows us to have them organized and easy to work with. 
Next, create a schema for our root queries and mutations inside `schema/controller/PostController.graphql` file:

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
* `postSave(id: Int, title: String, text: String): Post` - inserts a new post or updates exist one
* `postDelete(id: Int): Boolean` - deletes post by requested post id

Our schemas are ready. Next step is to provide implementation for them.

### Define a Database Model

Since we want to store data inside sqlite database, 
we need to create a database table for our models.
To make TypeORM automatically create you a database table
for your "Post" model you need to define an [entity](http://typeorm.io/#/entities). 
Create a `src/entity/Post.js` file:

```javascript
import {EntitySchema} from "typeorm";

export const Post = new EntitySchema({
    name: "Post",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        title: {
            type: String
        },
        text: {
            type: String
        }
    }
});
```

Once we run our application TypeORM will create us a following table:

```shell
+-------------+--------------+----------------------------+
|                          post                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| title       | varchar(255) |                            |
| text        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

To learn more about entities refer to [TypeORM documentation](http://typeorm.io).

Now we'll be able to store our data in the database.
Next step is to create logic that will save and get this data from the database.

### Creating a Controller

Previously we added 4 root GraphQL queries:

* `posts: [Post]`
* `post(id: Int): Post`
* `postSave(id: Int, title: String, text: String): Post`
* `postDelete(id: Int): Boolean`

Logic that will handle those queries must be defined inside controller.
Create a new controller inside `src/controller/PostController.js` file:

```javascript
import {EntityManager} from "typeorm";
import {Post} from "../entity/Post";

export class PostController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
    }

    // serves "posts: [Post]" requests
    posts() {
        return this.entityManager.find(Post);
    }

    // serves "post(id: Int): Post" requests
    post({ id }) {
        return this.entityManager.findOne(Post, id);
    }

    // serves "postSave(id: Int, title: String, text: String): Post" requests
    postSave(args) {
        const post = this.entityManager.create(Post, args);
        return this.entityManager.save(Post, post);
    }

    // serves "postDelete(id: Int): Boolean" requests
    postDelete({ id }) {
        return this.entityManager
            .remove(Post, { id: id })
            .then(() => true);
    }

}
```

EntityManager is a TypeORM object that is used to work with the database. 
Learn more about it in [TypeORM documentation](http://typeorm.io/#/working-with-entity-manager).

That's it! We have a controller that does what we need - it gets us all posts, 
get a single post by id, saves and removes posts.

Now we need to create a configuration and bootstrap files that will run all this magic. 

### Running application

To use TypeORM you need to create `ormconfig.json` file in the root of your application:

```
├── src
│   └── ...
│   
├── ormconfig.json
└── package.json
```

With following configuration:

```json
{
  "type": "sqlite",
  "database": "database.sqlite",
  "synchronize": true,
  "logging": false
}
```

This will tell TypeORM to use SQLite database and store your data inside `database.sqlite` file.
Learn more about `ormconfig` from [TypeORM documentation](http://typeorm.io/#/using-ormconfig).

Now we only need to bootstrap our Vesper application. Let's create a `src/index.js` file:

```javascript
import {bootstrap} from "vesper";
import {PostController} from "./controller/PostController"; 
import {Post} from "./entity/Post"; 

bootstrap({
    port: 3000,
    controllers: [
        { controller: PostController, action: "posts", type: "query" },
        { controller: PostController, action: "post", type: "query" },
        { controller: PostController, action: "postSave", type: "mutation" },
        { controller: PostController, action: "postDelete", type: "mutation" },
    ],
    entities: [
        Post
    ],
    schemas: [
        __dirname + "/schema/**/*.graphql"
    ]
}).then(() => {
    console.log("Your app is up and running on http://localhost:3000. " +
                "You can use playground in development mode on http://localhost:3000/playground");
}).catch(error => {
    console.error(error.stack ? error.stack : error);
});
```

Here we told to the framework to register our controller, entity, GraphQL schemas and run app on port `3000`.
Now you can run the application:

```
node ./src/index.js
```

That's it, your app is up ready to serve your GraphQL client queries! 

### Working with application

Vesper provides you a [GraphQL Playground](https://github.com/graphcool/graphql-playground) out of the box in the development mode, you can access it via:

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
Example repository for this sample is available [here](https://github.com/graphframework/javascript-simple-example).