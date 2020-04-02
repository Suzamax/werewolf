import {Controller, Param, Body, Get, Post, Put, Delete, Render} from "routing-controllers";

@Controller()
export class VillageController {

    @Get("/")
    @Render("index")
    getIndexPage() {
        return {
            title: "Werewolf"
        }
    }
}