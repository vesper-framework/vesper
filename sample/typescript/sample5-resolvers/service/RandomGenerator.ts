import {Service} from "typedi";

@Service()
export class RandomGenerator {

    generate() {
        return Math.floor((Math.random() * 100) + 1);
    }

}