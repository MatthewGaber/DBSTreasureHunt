/// <reference path="./libs/phaser.d.ts" />

import { Level } from "./Level";


export class Game extends Phaser.Game
{  
    public constructor()
    {
        super(
            1500,
            1142,
            //window.innerWidth * window.devicePixelRatio,
            //window.innerHeight * window.devicePixelRatio,,
            Phaser.CANVAS,
            "gameDiv"
        );
        let btn = document.getElementById("startlevelbutton");
        btn.addEventListener("click", (e:Event) => this.startlevel());
        
    }
    public startlevel(){
        this.state.add("Level", Level, false);
        this.state.start("Level");
    }
}
