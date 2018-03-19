import {GraphStackFrameworkOptions} from "./options/GraphStackFrameworkOptions";
import * as express from "express";
import {Application} from "express";
import {Server} from "http";
import {graphiqlExpress} from "apollo-server-express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import {buildGraphStackSchema, getMetadataArgsStorage, graphStack} from "./index";
import {Container} from "typedi";
import * as fs from "fs";
import {SubscriptionServer} from "subscriptions-transport-ws";
import {execute, subscribe} from "graphql";
import expressPlayground from "graphql-playground-middleware-express";

const apolloUploadExpress = require("apollo-upload-server").apolloUploadExpress;

/**
 * Bootstraps GraphStack framework.
 * Registers controllers and middlewares, creates http server and database connection.
 */
export class GraphStackFramework {

    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    /**
     * Application's root path.
     */
    root: string = require("app-root-path").path;

    /**
     * Framework options.
     */
    options: GraphStackFrameworkOptions;

    /**
     * Express application instance.
     */
    application: Application;

    /**
     * Running http server instance.
     */
    server: Server;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(options: GraphStackFrameworkOptions) {
        this.options = options;
        this.application = options.expressApp || express();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Starts express application and http server.
     * If port is not given then port from the framework options will be used.
     */
    async start(): Promise<void> {

        // throw error if port was not set
        if (!this.options.port)
            throw new Error(`Cannot start server because port is not set. Please set port in the framework options.`);

        // set parameters to the container if defined
        let parameters = this.buildParameters();
        if (parameters) {
            Object.keys(parameters).forEach(key => {
                Container.set(key, parameters[key]);
            });
        }

        // use all middlewares user specified in options
        if (this.options.use)
            this.options.use.forEach(use => this.application.use(use));

        // register CORS if it was enabled
        if (this.options.cors)
            this.application.use(this.options.cors === true ? cors() : cors(this.options.cors));

        // register graphstack middleware with grahpql middleware inside
        const graphQLRoute = this.options.graphQLRoute || "/graphql";
        const schema = await buildGraphStackSchema(this.options);
        this.application.use(graphQLRoute, bodyParser.json(), apolloUploadExpress(), graphStack(schema));

        // start server on a given port
        return new Promise<void>((ok, fail) => {
            this.server = this.application.listen(this.options.port, (err: any) => {
                if (err)
                    return fail(err);

                // register the WebSocket for handling GraphQL subscriptions
                const hasSubscriptions = getMetadataArgsStorage().actions.filter(action => action.type === "subscription");
                if (hasSubscriptions) {
                    new SubscriptionServer(
                        { execute, subscribe, schema },
                        { server: this.server, path: "/subscriptions" }
                    );
                }

                // register GraphIQL
                if (this.options.graphIQLRoute === true || typeof this.options.graphIQLRoute === "string") {
                    const graphIQLRoute = (this.options.graphIQLRoute && typeof this.options.graphIQLRoute === "string") ? this.options.graphIQLRoute : "/graphiql";
                    const graphIOptions: any = { endpointURL: graphQLRoute };
                    if (hasSubscriptions)
                        graphIOptions.subscriptionsEndpoint = `ws://localhost:${this.options.port}/subscriptions`;
                    this.application.use(graphIQLRoute, graphiqlExpress(graphIOptions));
                }

                // register playground
                if (this.options.playground === true ||
                    typeof this.options.graphIQLRoute === "string" ||
                    (this.options.playground === undefined && process.env.NODE_ENV !== "prod")) {
                    const playgroundRoute = (this.options.playground && typeof this.options.playground === "string") ? this.options.playground : "/playground";
                    const graphIOptions: any = { endpoint: graphQLRoute };
                    if (hasSubscriptions)
                        graphIOptions.subscriptionsEndpoint = `ws://localhost:${this.options.port}/subscriptions`;
                    this.application.use(playgroundRoute, expressPlayground(graphIOptions));
                }

                ok();
            });
        });
    }

    /**
     * Stops express application and http server.
     */
    stop(): Promise<void> {
        if (!this.server)
            return Promise.resolve();

        return new Promise<void>((ok, fail) => {
            this.server.close((err: any) => err ? fail(err) : ok());
        });
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Builds configuration parameters to be injected into the container.
     */
    protected buildParameters(): any|undefined {
        let parameters: any;
        if (typeof this.options.parameters === "object") {
            parameters = this.options.parameters;

        } else if (typeof this.options.parameters === "string") {
            parameters = require(this.root + "/" + this.options.parameters);

        } else if ((this.options.parameters as string[]) instanceof Array) {
            (this.options.parameters  as string[]).reduce((parameters, fileName) => {
                return Object.assign(parameters, require(this.root + "/" + fileName));
            }, {});
        } else {
            if (fs.existsSync(this.root + "/config.json")) {
                parameters = require(this.root + "/config.json");
            }
        }

        return parameters;
    }

}
