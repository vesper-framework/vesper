import {ArgsValidatorInterface} from "../interface/ArgsValidatorInterface";
import {RoleCheckerInterface} from "../index";
import {EntitySchema} from "typeorm";

/**
 * Metadata for a single resolver action.
 */
export class ResolveMetadata {

    /**
     * Class on which resolver is applied.
     */
    target: Function;

    /**
     * Resolver name.
     */
    name: string;

    /**
     * Resolver entity class.
     */
    entity?: Function|EntitySchema<any>;

    /**
     * Method name.
     */
    methodName: string;

    /**
     * Resolving property name.
     * If not set then its equal to method name.
     */
    resolvingPropertyName: string;

    /**
     * Indicates if data loader is enabled for this resolver method.
     * By default data loader is disabled.
     */
    dataLoader: boolean = false;

    /**
     * Args validator used to validate resolve arguments.
     */
    validators: { new (): ArgsValidatorInterface<any> }[];

    /**
     * Special roles used to check user authorization status to access resolve.
     */
    authorizes: (any[]|{ new (): RoleCheckerInterface })[];

}