import {Service} from "typedi";

@Service()
export class Logger {

    log(message: string) {
        // you can use winston or any logger you want
        // you can inject currently authorized user, any request data via constructor injection
        console.log(message);
    }

}