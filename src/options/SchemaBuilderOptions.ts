import {GraphModule} from "./GraphModule";
import {Action} from "../";
import {ContainerInstance} from "typedi";

/**
 * Vesper middleware options.
 */
export interface SchemaBuilderOptions extends GraphModule {

    /**
     * List of modules to load.
     */
    modules?: { new (): GraphModule }[];

    /**
     * Special function used to check user authorization roles per request.
     * Should throw an error if authorization was failed.
     * Can return asynchronous value.
     */
    authorizationChecker?: (roles: any[], action: Action) => Promise<any>|any;

    /**
     * Can be used to setup container on each user request.
     * For example, you can setup a currently authorized user and store it in the container.
     * Can return asynchronous value.
     */
    setupContainer?: (container: ContainerInstance, action: Action) => Promise<any>|any;

    /**
     * Setups AsyncIterator to use it for subscriptions.
     */
    subscriptionAsyncIterator?: (triggers: string | string[]) => AsyncIterator<any>;

    /**
     * Resolves name for an entity.
     */
    entityResolverNamingStrategy?: (entity: Function) => string;

    /**
     * Additional resolvers (applied to all other class-based resolvers).
     */
    customResolvers?: any;

    /**
     * Additional type definitions (applied to all other type definitions).
     */
    customTypeDefs?: any;

    /**
     * Custom TypeORM connection options.
     */
    typeorm?: {
        /**
         * Custom TypeORM ConnectionOptionsReader options.
         */
        connectionOptionsReaderOptions?: {
            /**
             * Directory where ormconfig should be read from.
             * By default its your application root (where your app package.json is located).
             */
            root?: string,

            /**
             * Filename of the ormconfig configuration. By default its equal to "ormconfig".
             */
            configName?: string
        };

        /**
         * Custom TypeORM connection name. "default" by default
         */
        connectionName?: string;
    };

    /**
     * Logger to be used for error reporting.
     * By default console.error is used.
     */
    logger?: (error: any) => any;

    /**
     * List of key-value parameters to set into the container.
     * You can pass a parameter filenames (single or multiple files).
     */
    parameters?: object|string|string[];

}