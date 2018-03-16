import {ArgsValidatorInterface} from "../interface/ArgsValidatorInterface";
import {RoleCheckerInterface} from "../index";

/**
 * Represents a single module controller action.
 */
export interface GraphModuleControllerAction<T, P = keyof T> {

    /**
     * GraphQL resolver type.
     */
    type: "query"|"mutation"|"subscription";

    /**
     * Controller class.
     */
    controller: { new (): T };

    /**
     * Controller method.
     */
    action: P;

    /**
     * Optional GraphQL query/mutation/subscription name.
     * If not specified then action method will be used instead.
     */
    name?: string;

    /**
     * Indicates if transaction should be created for controller action.
     * By default it is enabled for mutation and disabled for query and subscription.
     */
    transaction?: boolean;

    /**
     * Args validator used to validate action arguments.
     */
    validators?: { new (): ArgsValidatorInterface<any> }[];

    /**
     * Special roles used to check user authorization status to access this action.
     */
    authorizes?: (any[]|{ new (): RoleCheckerInterface })[];

}