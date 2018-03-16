import {ArgsValidatorInterface} from "../interface/ArgsValidatorInterface";
import {RoleCheckerInterface} from "../index";

/**
 * Metadata for a single controller action.
 */
export class ActionMetadata {

    /**
     * Action type.
     */
    type: "query"|"mutation"|"subscription";

    /**
     * Target controller class.
     */
    target: Function;

    /**
     * Controller method.
     */
    methodName: string;

    /**
     * GraphQL query/mutation/subscription name.
     * If not specified by user then action method will be used instead.
     */
    name: string;

    /**
     * Indicates if transaction should be created for controller action.
     * By default it is enabled for mutation and disabled for query and subscription.
     */
    transaction: boolean;

    /**
     * Args validator used to validate action arguments.
     */
    validators: { new (): ArgsValidatorInterface<any> }[];

    /**
     * Special roles used to check user authorization status to access this action.
     */
    authorizes: (any[]|{ new (): RoleCheckerInterface })[];

}