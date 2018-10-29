const service = require("./service.js")
const fs = require("fs")
const mongoose = require("mongoose");
const STATUS_CODE = require("../utility/constants.js").STATUS_CODE;
const user = require("../data/db.js").user;
let userService;
let tapeService;

class SeedingService extends service{

    constructor() {
        super();
    }

    refreshServices(){
        userService = require("./index.js").get("user");
        tapeService = require("./index.js").get("tape");
    }

    seedUsers(){
        //get the json from the friends file.
        let content = fs.readFileSync("./utility/friends.json");
        let jsonContent = JSON.parse(content);

        let tmp;
        //loop through the json and create the users.
        for(let i = 0; i < jsonContent.length; i++){
            tmp = jsonContent[i];
            userService.createUser(tmp.first_name, tmp.last_name, tmp.email, tmp.phone, tmp.address, (response) => {
                console.log(response.data.data);
            })
        }
        return;
    }

    seedTapes(){
        //get the json from the videotapes file.
        let content = fs.readFileSync("./utility/videotapes.json");
        let jsonContent = JSON.parse(content);

        let tmp, date, year, month, day;
        //loop through the json and create the tapes.
        for(let i = 0; i < jsonContent.length; i++){
            tmp = jsonContent[i];
            year = tmp.release_date.substr(0, 4);
            month = tmp.release_date.substr(5, 2);
            day = tmp.release_date.substr(8, 2);
            date = new Date(year, month - 1, day).getTime();
            tapeService.createTape(tmp.title, tmp.director_first_name, tmp.director_last_name, 
                tmp.type, date, tmp.eidr, (response) => {
                console.log(response.data.data);
            })
        }
    }

};

module.exports = new SeedingService();
