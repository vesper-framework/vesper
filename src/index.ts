declare global {
  interface RequestInit {
  }
}

import "reflect-metadata";
import {MetadataArgsStorage} from "./metadata-args/MetadataArgsStorage";
import {VesperFramework} from "./VesperFramework";
import {VesperFrameworkOptions} from "./options/VesperFrameworkOptions";
import {NextFunction, Request, Response} from "express";
import {SchemaBuilder} from "./SchemaBuilder";
import {SchemaBuilderOptions} from "./options/SchemaBuilderOptions";
import {Container} from "typedi";
import {HttpQueryError, runHttpQuery} from "apollo-server-core";
import {GraphQLSchema} from "graphql";
import {CurrentRequest} from "./token/CurrentRequest";
import {CurrentResponse} from "./token/CurrentResponse";

// -------------------------------------------------------------------------
// Main exports
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Main exports
// -------------------------------------------------------------------------

export * from "./decorator/ArgsValidator";
export * from "./decorator/Authorized";
export * from "./decorator/Controller";
export * from "./decorator/Mutation";
export * from "./decorator/Query";
export * from "./decorator/Resolve";
export * from "./decorator/Resolver";
export * from "./decorator/Subscription";

export * from "./interface/Action";
export * from "./interface/ArgsValidatorInterface";
export * from "./interface/ResolverInterface";
export * from "./interface/RoleCheckerInterface";

export * from "./options/GraphModule";
export * from "./options/GraphModuleControllerAction";
export * from "./options/GraphModuleResolver";
export * from "./options/GraphModuleResolverMethod";
export * from "./options/VesperFrameworkOptions";
export * from "./options/SchemaBuilderOptions";

export * from "./token/CurrentResponse";
export * from "./token/CurrentRequest";

export * from "./util/ResolverUtils";

export * from "./VesperFramework";
// export * from "./ValidationError";

// -------------------------------------------------------------------------
// Main Functions
// -------------------------------------------------------------------------

/**
 * Gets metadata args storage.
 * Metadata args storage follows the best practices and stores metadata in a global variable.
 */
export function getMetadataArgsStorage(): MetadataArgsStorage {
    if (!(global as any).vesperMetadataArgsStorage)
        (global as any).vesperMetadataArgsStorage = new MetadataArgsStorage();

    return (global as any).vesperMetadataArgsStorage;
}

/**
 * Bootstraps framework the easiest way.
 */
export function bootstrap(options?: VesperFrameworkOptions): Promise<VesperFramework> {
    const framework = new VesperFramework(options);
    return framework.start().then(() => framework);
}

/**
 * Builds GraphQLSchema based on provided options.
 */
export function buildVesperSchema(options?: SchemaBuilderOptions): Promise<GraphQLSchema> {
    const middleware = new SchemaBuilder(options);
    return middleware.build();
}

/**
 * Vesper Express middleware.
 * You can use it in your own express setup.
 */
export function vesper(schema: any, options?: object) {
    const allOptions: any = {
        context: {},
        schema: schema,
        ...(options || {})
    };

    return (req: Request, res: Response, next: NextFunction) => {
        const container = Container.of(req);
        container.set(CurrentRequest, req);
        container.set(CurrentResponse, res);
        allOptions.context.container = container;
        allOptions.context.dataLoaders = {};
        return runHttpQuery([req, res], {
            method: req.method,
            options: allOptions,
            query: req.method === "POST" ? req.body : req.query,
        }).then((gqlResponse) => {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Content-Length", String(Buffer.byteLength(gqlResponse, "utf8")));
            res.write(gqlResponse);
            res.end();

            // request has finished - reset container
            Container.reset(req);

        }, (error: HttpQueryError) => {
            if ("HttpQueryError" !== error.name)
                return next(error);

            if (error.headers) {
                Object.keys(error.headers).forEach(header => {
                    res.setHeader(header, error.headers[header]);
                });
            }

            res.statusCode = error.statusCode;
            res.write(error.message);
            res.end();
        });
    };
}