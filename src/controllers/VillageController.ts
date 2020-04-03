import {Controller, Param, Get, Redirect, Render} from "routing-controllers";

@Controller()
export class VillageController {

    @Get("/")
    @Render("index")
    getIndexPage() {
        return {
            title: "Werewolf",
            subtitle: "Los Hombres Lobo de Castronegro"
        }
    }

    @Get("/village")
    @Render("village")
    getVillage() {
        return undefined;
    }

    @Get("/townhall")
    @Render("townhall")
    getTownHall() {
        return {
            title: "Townhall",
            subtitle: "Create a game"
        };
    }

    @Get("/create/:w/:v/:r")
    @Redirect("/village")
    getNewVillage(@Param("w") w: number, @Param("v") v: number, @Param("r") r: number) {
        return "/village?w=" + w
                + "&v=" + v
                + "&r=" + r
                + "&nick=GAMEMASTER"
                + "#" + Math.random().toString(36).substring(7)
                ;
    }
}