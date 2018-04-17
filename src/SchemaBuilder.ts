import "reflect-metadata";
import {Container} from "typedi";
import {getMetadataArgsStorage} from "./index";
import {
    Connection,
    ConnectionOptionsReader,
    getConnectionManager,
    getMetadataArgsStorage as getTypeORMMetadataArgsStorage
} from "typeorm";
import {GraphQLScalarType, GraphQLSchema, Kind} from "graphql";
import {makeExecutableSchema} from "graphql-tools";
import {ActionMetadataBuilder} from "./metadata/ActionMetadataBuilder";
import {ActionMetadata} from "./metadata/ActionMetadata";
import {ResolveMetadataBuilder} from "./metadata/ResolveMetadataBuilder";
import {ResolveMetadata} from "./metadata/ResolveMetadata";
import {GraphModule} from "./options/GraphModule";
import {ActionExecutor} from "./ActionExecutor";
import {SchemaBuilderOptions} from "./options/SchemaBuilderOptions";
import {CurrentRequest} from "./token/CurrentRequest";
import {CurrentResponse} from "./token/CurrentResponse";
import {withFilter} from "graphql-subscriptions";
import DataLoader = require("dataloader");

const GraphQLUpload = require("apollo-upload-server").GraphQLUpload;
const {mergeTypes, fileLoader} = require("merge-graphql-schemas");
const debug = require("debug");

/**
 * Builds graphql schema needed for graphql server.
 */
export class SchemaBuilder {

    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    /**
     * Framework options.
     */
    options: SchemaBuilderOptions;

    /**
     * Framework options.
     */
    connection?: Connection;

    // -------------------------------------------------------------------------
    // Protected Properties
    // -------------------------------------------------------------------------

    /**
     * Graph modules.
     */
    protected modules: GraphModule[];

    /**
     * All built actions.
     */
    protected actionMetadatas: ActionMetadata[];

    /**
     * All resolve actions.
     */
    protected resolveMetadatas: ResolveMetadata[];

    /**
     * Used to execute controller actions.
     */
    protected actionExecutor: ActionExecutor;

    /**
     * Loggers used to log debug messages.
     */
    protected loggers = {
        query: debug("graphql:controller:query") as (str: string) => any,
        mutation: debug("graphql:controller:mutation") as (str: string) => any,
        resolver: debug("graphql:resolver") as (str: string) => any
    };

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(options: SchemaBuilderOptions) {
        this.options = options;
        this.modules = this.buildModules();
        this.actionMetadatas = new ActionMetadataBuilder(this.options, getMetadataArgsStorage()).build(this.modules);
        this.resolveMetadatas = new ResolveMetadataBuilder(this.options, getMetadataArgsStorage()).build(this.modules);
        this.actionExecutor = new ActionExecutor(this);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Creates ORM connection and builds grahpql schema.
     */
    async build(): Promise<GraphQLSchema> {

        // create database connection
        this.connection = await this.createORMConnection();

        const schemaTypes = this.loadSchemaTypes();
        const resolvers: any = {};
        this.createDefaultResolvers(resolvers);
        this.buildControllerResolvers(resolvers);
        this.buildModelResolversFromEntityMetadata(resolvers);
        this.buildCustomResolvers(resolvers);
        if (this.options.customResolvers)
            Object.assign(resolvers, this.options.customResolvers);

        return makeExecutableSchema({
            typeDefs: "scalar Date \r\n scalar Upload \r\n" + mergeTypes(schemaTypes) + "\r\n" + (this.options.customTypeDefs || ""),
            resolvers: resolvers,
            resolverValidationOptions: {
                allowResolversNotInSchema: true
            },
            logger: {
                log: (error: any) => {
                    // todo: need to finish implementation
                    // console.log((error as ValidationError).name);
                    // console.log((error as ValidationError).toString());
                    // console.log(error instanceof ValidationError);

                    // skip user-made validation errors
                    // if ((error as ValidationError).name === "ValidationError")
                    //     return;

                    if (this.options.logger)
                        return this.options.logger(error);

                    console.log((error as Error).stack ? (error as Error).stack : error);
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Builds all modules used in the app.
     */
    protected buildModules(): GraphModule[] {
        const modules: GraphModule[] = [this.options];
        if (this.options.modules) {
            this.options.modules.forEach(module => {
                if (module instanceof Function) {
                    modules.push(Container.get(module));
                } else {
                    modules.push(module);
                }
            });
        }
        return modules;
    }

    /**
     * Creates database connection if ormconfig was found.
     */
    protected async createORMConnection(): Promise<Connection|undefined> {
        const readerOptions = this.options.typeorm && this.options.typeorm.connectionOptionsReaderOptions || {};
        const name = this.options.typeorm && this.options.typeorm.connectionName || "default";
        const hasConnection = await new ConnectionOptionsReader(readerOptions).has(name);
        if (hasConnection) {
            const options = await new ConnectionOptionsReader(readerOptions).get(name);
            if (!options.entities)
                Object.assign(options, { entities: [] });
            if (!options.subscribers)
                Object.assign(options, { subscribers: [] });
            this.modules.forEach(module => {
                if (module.entities)
                    module.entities.forEach(entity => options.entities.push(entity));
                if (module.entitySubscribers)
                    module.entitySubscribers.forEach(entity => options.subscribers.push(entity));
                if (module.entityRepositories) {
                    module.entityRepositories.forEach(repository => {
                        getTypeORMMetadataArgsStorage().entityRepositories.push({
                            target: repository.repository,
                            entity: repository.entity,
                        });
                    });
                }
                // todo: what about migrations ?
            });
            return getConnectionManager().create(options).connect();
        }
    }

    /**
     * Loads all schemas from all schema directories.
     */
    protected loadSchemaTypes(): string[] {

        // collect all schemas from all modules
        const schemas = this.modules.reduce((schemas, module) => {
            if (module.schemas)
                schemas.push(...module.schemas);
            return schemas;
        }, [] as string[]);

        // if schemas are not defined in the configuration then throw an error
        if (!schemas.length)
            throw new Error(`You must provide "schemas" in the configuration options where from GraphQL schemas must be loaded and used.`);

        // load all schemas
        return schemas.reduce((types, schemaDir) => {
            types.push(...fileLoader(schemaDir));
            return types;
        }, []);
    }

    /**
     * Default resolvers provided by the framework.
     */
    protected createDefaultResolvers(resolvers: any): void {
        Object.assign(resolvers, {
            Date: new GraphQLScalarType({
                name: "Date",
                description: "Date custom scalar type",
                parseValue(value) {
                    return new Date(value); // value from the client
                },
                serialize(value) {
                    return value.getTime(); // value sent to the client
                },
                parseLiteral(ast) {
                    if (ast.kind === Kind.INT) {
                        return parseInt(ast.value, 10); // ast value is always in string format
                    }
                    return null;
                },
            }),
            Upload: GraphQLUpload
        });
    }

    /**
     * Builds resolvers from the graph controllers.
     */
    protected buildControllerResolvers(resolvers: any): void {
        this.actionMetadatas.forEach(action => {

            const resolverType = this.getResolverType(action.type);
            if (!resolvers[resolverType]) resolvers[resolverType] = {};

            if (resolverType === "Subscription") {
                if (!this.options.subscriptionAsyncIterator)
                    throw new Error(`"subscriptionAsyncIterator" must be defined in the framework options in order to use subscriptions.`);

                const that = this;
                resolvers[resolverType][action.name || action.methodName] = {
                    subscribe: withFilter(() => this.options.subscriptionAsyncIterator(action.name || action.methodName), function (playload: any, args: any, context: any, info: any) {
                        const container = Container.of(this);
                        context.container = container;
                        const executionResult = that.actionExecutor.executeControllerAction({
                            metadata: action,
                            request: undefined,
                            response: undefined,
                            container: container,
                            obj: playload,
                            args: args,
                            context: context,
                            info: info
                        });
                        if (executionResult instanceof Promise) {
                            return executionResult.then(result => {
                                if (result === undefined)
                                    return true;
                                return result;
                            });
                        } else {
                            if (executionResult === undefined)
                                return true;
                            return executionResult;
                        }
                    })
                };

            } else {
                resolvers[resolverType][action.name] = (parent: any, args: any, context: any, info: any) => {
                    this.loggers[action.type as "query"|"mutation"](`controller action "${action.name}"`);
                    return this.actionExecutor.executeControllerAction({
                        metadata: action,
                        request: context.container.get(CurrentRequest),
                        response: context.container.get(CurrentResponse),
                        container: context.container,
                        obj: parent,
                        args: args,
                        context: context,
                        info: info
                    });
                };
            }
        });
    }

    /**
     * Builds model resolvers from entity metadatas.
     * Used to automatically return entity relations.
     */
    protected buildModelResolversFromEntityMetadata(resolvers: any): void {
        if (!this.connection)
            return;

        this.connection.entityMetadatas.forEach(entityMetadata => {
            const resolverName = this.options.entityResolverNamingStrategy && entityMetadata.target instanceof Function
                ? this.options.entityResolverNamingStrategy(entityMetadata.target)
                : entityMetadata.targetName;
            if (!resolverName)
                return;

            if (!resolvers[resolverName]) resolvers[resolverName] = {};
            entityMetadata.relations.forEach(relation => {

                // make sure not to override method if it was defined by user
                resolvers[resolverName][relation.propertyName] = (parent: any, args: any, context: any, info: any) => {
                    this.loggers.resolver(`entity relation "${resolverName}.${relation.propertyName}"`);

                    // make sure not to override method if it was defined by user
                    if (parent[relation.propertyName] !== undefined)
                        return parent[relation.propertyName];

                    if (!context.dataLoaders[resolverName])
                        context.dataLoaders[resolverName] = {};

                    // define data loader for this method if it was not defined yet
                    if (!context.dataLoaders[resolverName][relation.propertyName]) {
                        context.dataLoaders[resolverName][relation.propertyName] = new DataLoader((keys: { parent: any, args: any, context: any, info: any }[]) => {
                            const entities = keys.map(key => key.parent);
                            return this.connection
                                .relationIdLoader
                                .loadManyToManyRelationIdsAndGroup(relation, entities)
                                .then(groups => groups.map(group => group.related));

                        }, {
                            cacheKeyFn: (key: { parent: any, args: any, context: any, info: any }) => {
                                const {parent, args} = key;
                                const entityIds = entityMetadata.getEntityIdMap(parent);
                                return JSON.stringify({ entity: entityIds, args: args });
                            }
                        });
                    }
                    return context.dataLoaders[resolverName][relation.propertyName].load({ parent, args, context, info });
                };
            });
        });
    }

    /**
     * Builds resolvers from the resolve metadatas.
     */
    protected buildCustomResolvers(resolvers: any): void {

        // register custom defined resolvers
        this.resolveMetadatas.forEach(resolve => {

            if (!resolvers[resolve.name])
                resolvers[resolve.name] = {};

            if (resolve.target.prototype[resolve.methodName] === undefined)
                return;

            resolvers[resolve.name][resolve.methodName] = (parent: any, args: any, context: any, info: any) => {
                this.loggers.resolver(`model property "${resolve.name}.${resolve.methodName}"`);

                if (resolve.dataLoader) {

                    if (!context.dataLoaders[resolve.name] || !context.dataLoaders[resolve.name][resolve.methodName]) {
                        if (!context.dataLoaders[resolve.name])
                            context.dataLoaders[resolve.name] = {};

                        context.dataLoaders[resolve.name][resolve.methodName] = new DataLoader((keys: { parent: any, args: any, context: any, info: any }[]) => {
                            const entities = keys.map(key => key.parent);
                            const result = this.actionExecutor.executeResolver({
                                metadata: resolve,
                                request: context.container.get(CurrentRequest),
                                response: context.container.get(CurrentResponse),
                                container: context.container,
                                obj: entities,
                                args: keys[0].args,
                                context: keys[0].context,
                                info: keys[0].info
                            });
                            if (!(result instanceof Promise))
                                return Promise.resolve(result);

                            return result;
                        }, {
                            cacheKeyFn: (key: { parent: any, args: any, context: any, info: any }) => {
                                return JSON.stringify({parent: key.parent, args: key.args});
                            }
                        });
                    }

                    return context.dataLoaders[resolve.name][resolve.methodName].load({ parent, args, context, info });

                } else {
                    return this.actionExecutor.executeResolver({
                        metadata: resolve,
                        request: context.container.get(CurrentRequest),
                        response: context.container.get(CurrentResponse),
                        container: context.container,
                        obj: parent,
                        args: args,
                        context: context,
                        info: info
                    });
                }
            };
        });
    }

    /**
     * Gets resolver type from the given action type.
     */
    protected getResolverType(actionType: string): string {
        if (actionType === "query") {
            return "Query";

        } else if (actionType === "mutation") {
            return "Mutation";

        } else if (actionType === "subscription") {
            return "Subscription";
        }
    }

}
