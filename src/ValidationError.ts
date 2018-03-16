/**
 * Can be used to throw validation error which logger skips when it output errors.
 * Useful, if you don't want user validation errors to show up in your console.
 */
export class ValidationError extends Error {
    name = "ValidationError";
    constructor(message: string) {
        super(message);
        // this.name = "ValidationError";
        // this.message = message;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

}