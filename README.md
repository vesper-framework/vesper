# Vesper

Vesper is a NodeJS framework that helps you to create scalable, maintainable, extensible, declarative and fast
[GraphQL](https://graphql.org/)-based server applications.
It perfectly fits any architecture and scale you choose - from monoliths to microservices, from small to enterprise apps. 

Using Vesper your app's core components are:

* Controllers (root queries)
* Args (e.g. GraphQL resolver args or user input)
* Models
* Resolvers
* Services
* GraphQL schemas defined in `.graphql` format

Vesper provides you following features:

* Controllers framework for your root queries
* Maintainable GraphQL resolvers framework with data loader out of the box
* User input validation framework with ability to use any validation library
* User authorization and access control framework
* Modules framework for large and scalable applications
* Integration with [TypeORM](http://typeorm.io/) and ability to use any other ORM or database source
* Automatic database relations resolver
* Automatic transaction wrapper for your mutations
* [Powerful service container](https://github.com/typestack/typedi) for code organization and seamless testing
* Ability to use model interfaces across backend and frontend
* Uses Express and Apollo Server and you have all power of these tools

And more...

## Quick Start

To create a new JavaScript project using Vesper install it globally and use `init` command
with `--javascript` flag:

```
npm i vesper -g
vesper init --name my-project --javascript
```

To create a new TypeScript project using Vesper install it globally and use `init` command
with `--typescript` flag:

```
npm i vesper -g
vesper init --name my-project --typescript
```

## Documentation

* [JavaScript documentation](http://vesper-framework.com/javascript/getting-started)
* [JavaScript samples](https://github.com/vesper-framework/vesper/tree/master/sample/javascript)
* [TypeScript documentation](http://vesper-framework.com/typescript/getting-started)
* [TypeScript samples](https://github.com/vesper-framework/vesper/tree/master/sample/typescript)

## Links

* [JavaScript simple example project](https://github.com/vesper-framework/javascript-simple-example)
* [JavaScript advanced example project](https://github.com/vesper-framework/javascript-advanced-example)
* [TypeScript simple example project](https://github.com/vesper-framework/typescript-simple-example)
* [TypeScript advanced example project](https://github.com/vesper-framework/typescript-advanced-example)

## Contributing

Want to contribute? Vesper is opened for any contributions, just create a new [github issue](https://github.com/vesper-framework/vesper/issues/new)!