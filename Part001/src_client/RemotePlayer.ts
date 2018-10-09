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
        //this.load.image("ninjaleft", "./images/ninjaleft.png");

        //this.load.image("ninjaleft", "./images/ninjaleft.png");
        //this.player = state.add.sprite(this.x, this.y);
        console.log("1 Remote Player x and y" + this.x, this.y);
        this.player = state.add.sprite(this.x, this.y, 'ninjaleft');
        state.physics.arcade.enableBody(this.player);
        console.log("2 Remote Player x and y" + this.x, this.y);
        var name = state.add.text(20, -5, this.username, {font:'18px Arial', fill: '#FF0000', align: 'center'});

        name.anchor.set(0.5)
        this.player.addChild(name);
        
       
        //this.player.body.clearShapes();
        //this.player.body.data.shapes[0].sensor = true;
        
    }
}
