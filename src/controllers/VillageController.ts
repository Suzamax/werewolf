import {Controller, Param, Body, Get, Post, Put, Delete, Render} from "routing-controllers";

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
    @Render("")
    getTownHall() {
        return undefined;
    }

    @Post("/townhall/create/:w/:v/:r")
    post(@Param("w") w: number, @Param("v") v: number, @Param("r") r: number) {
        return undefined;
    }
}