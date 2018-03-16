import {Controller, Query} from "../../../../src";
import {Container} from "typedi";

@Controller()
export class TokenController {

    @Query()
    token(): Promise<string> {
        return Container.get("token");
    }

}