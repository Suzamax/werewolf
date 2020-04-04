import {Controller, Param, Get, Redirect, Render} from "routing-controllers";

@Controller()
export class VillageController {

    @Get("/")
    @Render("index")
    getIndexPage() {
        return {
            title: "Werewolf",
            subtitle: "Town Sleeps... - Online"
        }
    }

    @Get("/village")
    @Render("village")
    getVillage() {
        return undefined;
    }

}