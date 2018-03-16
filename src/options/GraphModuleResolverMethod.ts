import {ArgsValidatorInterface} from "../interface/ArgsValidatorInterface";
import {RoleCheckerInterface} from "../index";

/**
 * Used to register a module resolver method.
 */
export interface GraphModuleResolverMethod {

    /**
     * Method name.
     */
    methodName: string;

    /**
     * Resolving property name.
     * Optional, if not set then its equal to method name.
     */
    name?: string;

    /**
     * Indicates if data loader is enabled for this resolver method.
     * By default data loader is disabled.
     */
    many?: boolean;

    /**
     * Args validator used to validate resolver arguments.
     */
    validators?: { new (): ArgsValidatorInterface<any> }[];

    /**
     * Special roles used to check user authorization status to access this resolver.
     */
    authorizes?: (any[]|{ new (): RoleCheckerInterface })[];

}