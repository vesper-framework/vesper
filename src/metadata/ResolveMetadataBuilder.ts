import {GraphModule} from "../options/GraphModule";
import {Utils} from "../util/Utils";
import {MetadataArgsStorage} from "../metadata-args/MetadataArgsStorage";
import {ResolveMetadata} from "./ResolveMetadata";
import {ResolveMetadataArgs} from "../metadata-args/ResolveMetadataArgs";
import {GraphModuleResolverMethod} from "../options/GraphModuleResolverMethod";
import {ResolverMetadataArgs} from "../metadata-args/ResolverMetadataArgs";
import {GraphModuleResolver} from "../options/GraphModuleResolver";
import {SchemaBuilderOptions} from "../options/SchemaBuilderOptions";
import {AuthorizedMetadataArgs} from "../metadata-args/AuthorizedMetadataArgs";
import {ArgsValidatorMetadataArgs} from "../metadata-args/ArgsValidatorMetadataArgs";
import {EntitySchema} from "typeorm";

/**
 * Builds resolve metadatas.
 */
export class ResolveMetadataBuilder {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(protected options: SchemaBuilderOptions,
                protected metadataArgsStorage: MetadataArgsStorage) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Builds resolve metadatas based on the given stack options and metadata args storage.
     */
    build(modules: GraphModule[]): ResolveMetadata[] {
        const resolves: ResolveMetadata[] = [];

        // first load controllers
        // thus we are filling metadata args storage
        modules.forEach(module => {
            if (!module.resolvers)
                return;

            const resolverDirs = module.resolvers.filter(resolver => typeof resolver === "string") as string[];
            Utils.importClassesFromDirectories(resolverDirs);
        });

        // now we have all metadata args registered in the storage, first read all resolvers from the storage
        this.metadataArgsStorage.resolvers.forEach(resolver => {
            this.metadataArgsStorage.resolves.forEach(resolve => {
                if (resolve.target !== resolver.target)
                    return;

                const validators = this.metadataArgsStorage.validators.filter(validator => validator.target === resolve.target && validator.methodName === resolve.methodName);
                const authorizes = this.metadataArgsStorage.authorizes.filter(authorize => authorize.target === resolve.target && authorize.methodName === resolve.methodName);
                resolves.push(this.createFromMetadataArgs(resolver, resolve, validators, authorizes));
            });
        });

        // now register all resolves passed in the array of modules
        modules.forEach(module => {
            if (module.resolvers) {
                module.resolvers.forEach(resolver => {
                    if (typeof resolver === "object") {
                        resolver.methods.forEach(method => {
                            resolves.push(this.createFromModuleResolver(resolver, method));
                        });
                    }
                });
            }
        });

        return resolves;
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Creates ResolveMetadata from the given resolver and resolve metadata args objects.
     */
    protected createFromMetadataArgs(resolver: ResolverMetadataArgs, resolve: ResolveMetadataArgs, validators: ArgsValidatorMetadataArgs[], authorizes: AuthorizedMetadataArgs[]): ResolveMetadata {
        const metadata = new ResolveMetadata();
        metadata.target = resolver.target;
        if (resolver.name instanceof Function) {
            metadata.name = this.options.entityResolverNamingStrategy ? this.options.entityResolverNamingStrategy(resolver.name) : resolver.name.name;
            metadata.entity = resolver.name;
        } else {
            metadata.name = resolver.name;
        }
        metadata.methodName = resolve.methodName;
        metadata.resolvingPropertyName = resolve.name || resolve.methodName;
        metadata.dataLoader = resolve.dataLoader === true ? true : false;
        metadata.validators = validators.map(validator => validator.validator);
        metadata.authorizes = authorizes.map(authorize => authorize.roles);
        return metadata;
    }

    /**
     * Creates ResolveMetadata from the given GraphModule resolver and method objects.
     */
    protected createFromModuleResolver(resolver: GraphModuleResolver, method: GraphModuleResolverMethod|string): ResolveMetadata {
        const metadata = new ResolveMetadata();
        metadata.target = resolver.resolver;
        if (resolver.model instanceof Function) {
            metadata.name = this.options.entityResolverNamingStrategy ? this.options.entityResolverNamingStrategy(resolver.model) : resolver.model.name;
            metadata.entity = resolver.model;

        } else if (resolver.model instanceof EntitySchema) {
            metadata.name = resolver.model.options.name;
            metadata.entity = resolver.model;

        } else {
            metadata.name = resolver.model;
        }
        if (typeof method === "string") {
            metadata.methodName = method;
            metadata.resolvingPropertyName = method;
            metadata.dataLoader = false;
            metadata.validators = [];
            metadata.authorizes = [];
        } else {
            metadata.methodName = method.methodName;
            metadata.resolvingPropertyName = method.name || method.methodName;
            metadata.dataLoader = method.many === true ? true : false;
            metadata.validators = method.validators || [];
            metadata.authorizes = method.authorizes || [];
        }
        return metadata;
    }

}