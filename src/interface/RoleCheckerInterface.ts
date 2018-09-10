import {Action} from "./Action";

/**
 * Allows to defined authorization checking logic per-controller action.
 */
export interface RoleCheckerInterface {

    /**
     * Checks if user has an access to this controller action.
     * If authorization has failed it must reject or throw an error.
     */
    check(action: Action): any|Promise<any>;

}