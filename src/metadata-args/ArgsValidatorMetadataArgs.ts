import {ArgsValidatorInterface} from "../interface/ArgsValidatorInterface";

/**
 * Used to register args validator.
 */
export interface ArgsValidatorMetadataArgs {

    /**
     * Controller class on which validator is applied.
     */
    target: Function;

    /**
     * Method on which validator is applied.
     */
    methodName: string;

    /**
     * Validator class.
     */
    validator: { new (): ArgsValidatorInterface<any> };
    
}