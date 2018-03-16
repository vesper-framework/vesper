import {getMetadataArgsStorage} from "../index";
import {ArgsValidatorInterface} from "../interface/ArgsValidatorInterface";

/**
 * Uses given validator to validate query / mutation args.
 */
export function ArgsValidator(validator: { new (): ArgsValidatorInterface<any> }): Function {
    return function (object: Object, methodName: string) {
        getMetadataArgsStorage().validators.push({
            target: object.constructor,
            methodName: methodName,
            validator: validator,
        });
    };
}