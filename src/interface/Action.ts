import {Request, Response} from "express";
import {ContainerInstance} from "typedi";
import {ActionMetadata} from "../metadata/ActionMetadata";
import {GraphQLResolveInfo} from "graphql";
import {ResolveMetadata} from "../metadata/ResolveMetadata";

/**
 * Controller action properties.
 */
export interface Action {

    /**
     * Scoped container in which this action is running.
     */
    container: ContainerInstance;

    /**
     * Action Request object.
     * Can be undefined only in subscriptions.
     */
    request?: Request;

    /**
     * Action Response object.
     * Can be undefined only in subscriptions.
     */
    response?: Response;

    /**
     * Executing action metadata.
     * For controller actions its ActionMetadata and for resolvers its ResolveMetadata.
     */
    metadata: ActionMetadata|ResolveMetadata;

    /**
     * The object that contains the result returned from the resolver on the parent field, or,
     * in the case of a top-level Query field, the rootValue passed from the server configuration.
     * This argument enables the nested nature of GraphQL queries.
     */
    obj: any;

    /**
     * An object with the arguments passed into the field in the query.
     * For example, if the field was called with author(name: "Ada"), the args object would be: { "name": "Ada" }.
     */
    args: any;

    /**
     * This is an object shared by all resolvers in a particular query,
     * and is used to contain per-request state, including authentication information, dataloader instances,
     * and anything else that should be taken into account when resolving the query.
     */
    context: any;

    /**
     * This argument should only be used in advanced cases,
     * but it contains information about the execution state of the query,
     * including the field name, path to the field from the root, and more.
     */
    info: GraphQLResolveInfo;

}
