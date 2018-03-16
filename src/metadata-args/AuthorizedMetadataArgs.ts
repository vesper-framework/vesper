import {RoleCheckerInterface} from "../";

/**
 * Used to register authorized.
 */
export interface AuthorizedMetadataArgs {

    /**
     * Controller class on which authorized is applied.
     */
    target: Function;

    /**
     * Method on which authorized is applied.
     */
    methodName: string;

    /**
     * Roles requested for this authorization.
     */
    roles: any[]|{ new (): RoleCheckerInterface };

}