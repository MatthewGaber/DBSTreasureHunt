///<reference path="./libs/phaser.d.ts" />

import { Game } from "phaser-ce";

export class RemotePlayer 
{
    public id: string;
    public x: number;
    public y: number;
    public username: string;
    public angle: number;
    public mysprite: string;
    public player: Phaser.Sprite;
    

    public constructor(
        id: string,
        startX: number,
        startY: number,
        username:string,
        startAngle: number,
        mysprite: string,
        state: Phaser.State)
    {
        
        this.id = id;
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;
        this.username = username;
        this.mysprite = mysprite;
        
        
        this.player = state.add.sprite(this.x, this.y, mysprite);
        state.physics.enable(this.player, Phaser.Physics.ARCADE)
        state.physics.arcade.enableBody(this.player);
        this.player.body.collideWorldBounds = true;
        
        if (mysprite == 'ninjaleft'){
        var name = state.add.text(20, -5, this.username, {font:'15px Arial', fill: '#0024ff', align: 'center'});
        } else {
            var name = state.add.text(20, -5, this.username, {font:'15px Arial', fill: '#ff00de', align: 'center'});
        }
        name.anchor.set(0.5)
        this.player.addChild(name);
        
       
       
        
    }
}
