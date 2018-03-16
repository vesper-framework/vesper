import {GraphModuleControllerAction} from "./GraphModuleControllerAction";
import {GraphModuleResolver} from "./GraphModuleResolver";

/**
 * GraphQL module used to register controllers, queries, mutations, entities, schemas, etc.
 */
export interface GraphModule {

    /**
     * List of paths where from graphql schemas must be loaded and registered.
     */
    schemas?: string[]; // todo: support non-file schemas as well?

    /**
     * Controllers needs to be registered in the framework.
     */
    controllers?: (Function|string|GraphModuleControllerAction<any>)[];

    /**
     * Subscriptions needs to be registered.
     */
    subscriptions?: GraphModuleControllerAction<any>[];

    /**
     * Resolvers needs to be registered.
     */
    resolvers?: (Function|string|GraphModuleResolver)[];

    /**
     * Entities needs to be registered.
     * All entities are appended to the list of entities provided in ormconfig.
     * If you have already provided all entity paths in ormconfig then you don't need to specify entities again.
     */
    entities?: Function[];

    /**
     * Entity repositories needs to be registered.
     */
    entityRepositories?: { repository: Function, entity: Function }[];

    /**
     * Entity subscribers needs to be registered.
     * All subscribers are appended to the list of subscribers provided in ormconfig.
     * If you have already provided all subscriber paths in ormconfig then you don't need to specify subscribers again.
     */
    entitySubscribers?: (Function|string)[];

}