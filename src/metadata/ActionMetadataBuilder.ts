import {GraphModule} from "../options/GraphModule";
import {ActionMetadata} from "./ActionMetadata";
import {Utils} from "../util/Utils";
import {MetadataArgsStorage} from "../metadata-args/MetadataArgsStorage";
import {AuthorizedMetadataArgs} from "../metadata-args/AuthorizedMetadataArgs";
import {GraphModuleControllerAction} from "../options/GraphModuleControllerAction";
import {ArgsValidatorMetadataArgs} from "../metadata-args/ArgsValidatorMetadataArgs";
import {SchemaBuilderOptions} from "../options/SchemaBuilderOptions";
import {ActionMetadataArgs} from "../metadata-args/ActionMetadataArgs";

/**
 * Builds action metadatas.
 */
export class ActionMetadataBuilder {

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
     * Builds action metadatas based on the given stack options and metadata args storage.
     */
    build(modules: GraphModule[]): ActionMetadata[] {
        const actions: ActionMetadata[] = [];

        // first load controllers
        // thus we are filling metadata args storage
        modules.forEach(module => {
            if (!module.controllers)
                return;

            const controllerDirs = module.controllers.filter(controller => typeof controller === "string") as string[];
            Utils.importClassesFromDirectories(controllerDirs);
        });

        // now we have all metadata args registered in the storage, first read all controllers from the storage
        this.metadataArgsStorage.controllers.forEach(controller => {
            this.metadataArgsStorage.actions.forEach(action => {
                if (action.target !== controller.target)
                    return;

                const validators = this.metadataArgsStorage.validators.filter(validator => validator.target === action.target && validator.methodName === action.methodName);
                const authorizes = this.metadataArgsStorage.authorizes.filter(authorize => authorize.target === action.target && authorize.methodName === action.methodName);
                actions.push(this.createFromMetadataArgs(action, validators, authorizes));
            });
        });

        // now register all actions passed in the array of modules
        modules.forEach(module => {
            if (module.controllers) {
                module.controllers.forEach(controller => {
                    if (typeof controller === "object") {
                        actions.push(this.createFromModuleDefinition(controller.type, controller));
                    }
                });
            }
        });

        return actions;
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Creates ActionMetadata from the given ActionMetadataArgs object.
     */
    protected createFromMetadataArgs(action: ActionMetadataArgs, validators: ArgsValidatorMetadataArgs[], authorizes: AuthorizedMetadataArgs[]): ActionMetadata {
        const metadata = new ActionMetadata();
        metadata.type = action.type;
        metadata.target = action.target;
        metadata.methodName = action.methodName;
        metadata.name = action.name || action.methodName;
        metadata.transaction = action.transaction === true ? true : false;
        metadata.validators = validators.map(validator => validator.validator);
        metadata.authorizes = authorizes.map(authorize => authorize.roles);
        return metadata;
    }

    /**
     * Creates ActionMetadata from the given GraphModuleControllerAction object.
     */
    protected createFromModuleDefinition(type: "query"|"mutation"|"subscription", action: GraphModuleControllerAction<any>): ActionMetadata {
        const metadata = new ActionMetadata();
        metadata.type = type;
        metadata.target = action.controller;
        metadata.methodName = action.action;
        metadata.name = action.name || action.action;
        metadata.transaction = action.transaction === true ? true : false;
        metadata.validators = action.validators || [];
        metadata.authorizes = action.authorizes || [];
        return metadata;
    }

}