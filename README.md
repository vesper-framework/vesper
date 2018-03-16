# GraphStack

GraphStack is a NodeJS framework that helps you to create scalable, maintainable, extensible, declarative and fast 
[GraphQL](https://graphql.org/)-based server applications.
It perfectly fits any architecture and scale you choose - from monoliths to microservices, from small to enterprise apps. 

Using GraphStack your app's core components are:

* Controllers (root queries)
* Args (e.g. GraphQL resolver args or user input)
* Models
* Resolvers
* Services
* GraphQL schemas defined in `.graphql` format

GraphStack provides you following features:

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

And more...

## Quick Start

To create a new JavaScript project using GraphStack install it globally and use `init` command 
with `--javascript` flag:

```
npm i graphstack -g
graphstack init --name my-project --javascript
```

To create a new TypeScript project using GraphStack install it globally and use `init` command
with `--typescript` flag:

```
npm i graphstack -g
graphstack init --name my-project --typescript
```

## Documentation

* [JavaScript documentation](http://graphstack.io/?lang=javascript)
* [JavaScript samples](https://github.com/graphframework/graphstack/tree/master/sample/javascript)

* [TypeScript documentation](http://graphstack.io/?lang=typescript)
* [TypeScript samples](https://github.com/graphframework/graphstack/tree/master/sample/typescript)

## Links

* [JavaScript example project](https://github.com/graphframework/javascript-example)
* [TypeScript example project](https://github.com/graphframework/typescript-example)

## Contributing

Want to contribute? GraphStack is opened for any contributions, just create a [github issue](https://github.com/graphframework/graphstack/issues/new)!