///<reference path="./libs/phaser.d.ts" />

import { Game } from "phaser-ce";

export class RemotePlayer 
{
    public id: string;
    public x: number;
    public y: number;
    public username: string;
    public angle: number;
    public player: Phaser.Sprite;
    

    public constructor(
        id: string,
        startX: number,
        startY: number,
        username:string,
        startAngle: number,
        state: Phaser.State)
    {
        
        this.id = id;
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;
        this.username = username;
        
        if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
            this.player = state.add.sprite(this.x, this.y, 'ninjaleft');
        }
        if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
            this.player = state.add.sprite(0, 0, 'girlright');
        }
        state.physics.arcade.enableBody(this.player);
        
        if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
            var name = state.add.text(20, -5, this.username, {font:'15px Arial', fill: '#0024ff', align: 'center'});
        }
        if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
            var name = state.add.text(20, -5, this.username, {font:'15px Arial', fill: '#ff00de', align: 'center'});
        }
        
        name.anchor.set(0.5)
        this.player.addChild(name);
        
        
    }
}
