/**
 * Args validators must implement this interface.
 */
export interface ArgsValidatorInterface<T> {

    /**
     * Validates args.
     * If validation has failed it must reject or throw an error.
     */
    validate(args: T): Promise<any>|any;

}