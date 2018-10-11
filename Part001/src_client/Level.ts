/// <reference path="./libs/phaser.d.ts" />


import * as io from "socket.io-client";

import { GameProperties } from "./GameProperties";

import { PlayerHelper } from "./PlayerHelper";
import { RemotePlayer } from "./RemotePlayer";
import { textSpanIntersectsWithPosition } from "typescript";
import { Sprite } from "phaser-ce";


export class Level extends Phaser.State
{
    private _socket: SocketIOClient.Socket;
    private _player: Phaser.Sprite;
    private _enemyList: RemotePlayer[] = [];
    private treasure: Phaser.Sprite;
    //private playerCollisionGroup: Phaser.Physics.P2.CollisionGroup;
   
   
  
    public preload()
    {
        this.stage.disableVisibilityChange = true;
        this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.world.setBounds(
            0, 0,
            GameProperties.GameWidth, GameProperties.GameHeight);
        this.load.image("background", "./images/background1.jpg");
        this.load.image("ninjaleft", "./images/ninjaleft.png");
        this.load.image("girlright", "./images/girlright.png");
        this.load.image("treasure", "./images/treasure.png" )
       
    
    }
    
    public create()
    {
        this._socket = io.connect();
        this.add.image(0,0,"background")
        this.treasure = this.add.sprite(525, 425, 'treasure');
        this.treasure.visible = false;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.enable(this.treasure, Phaser.Physics.ARCADE);
        //this.treasure.setBounds(520, 420, 530, 430);
        this.treasure.body.collideWorldBounds = true;
        this.treasure.x = 525;
        this.treasure.y = 425;
        this.treasure.body.velocity=0;

        console.log("client started");
       
        this._socket.on("connect", () => { this.OnSocketConnected(); });
        
        // Listen to new enemy connections
        this._socket.on("new_enemyPlayer",
            (data: { id: string, x: number, y: number, username: string, angle: number, mysprite: string }) =>
            {
                this.OnNewPlayer(data);
            });

        // Listen to enemy movement 
        this._socket.on("enemy_move",
            (data: { id: string, x: number, y: number, angle: number }) =>
            {
                this.OnEnemyMove(data);
            });

        // When received remove_player, remove the player passed; 
        this._socket.on('remove_player',
            (data: { id: string }) =>
            {
                this.OnRemovePlayer(data);
            });
    }
    
    public update()
    {
        for (var i = 0; i < this._enemyList.length; i++) {
            if (this._enemyList[i]) {
              //this._enemyList[i].update()
              this.physics.arcade.collide(this._player, this._enemyList[i].player, this.collisionHandler)
              
            }
          }
        if (GameProperties.InGame){
            
        //this.input.update();
        let pointer = this.input.activePointer;

        if (pointer.isDown){
            if (PlayerHelper.DistanceToPointer(this._player, pointer) <= 50)
            {
             PlayerHelper.MoveToPointer(this._player, 0, pointer, 500);
             }
             else
            {
            PlayerHelper.MoveToPointer(this._player, 500, pointer, 500);
            }
            this.time.events.add(500, function () {
                this._player.body.velocity.x = 0;
                this._player.body.velocity.y = 0;
                }, this);
   
        //if (this._player.x >520 && this._player.x <530  && this._player.y >420 && this._player.y <430){
            //this.add.tileSprite(525 - (this.game.cache.getImage('treasure').width/2), 425 - (this.game.cache.getImage('treasure').height/2), this.game.cache.getImage('treasure').width, this.game.cache.getImage('treasure').height, 'treasure');
           // this.time.events.add(Phaser.Timer.SECOND * 4, this.showTreasure, this);
           // console.log("fade picture called");
        //} 
        
        }
        // Now check for a collision between objects
        this.physics.arcade.overlap(this._player, this.treasure, this.showTreasure, null, this);
        

        this._socket.emit('move_player', { x: this._player.body.x, y: this._player.body.y, angle: this._player.angle });

        }   
    }


    private collisionHandler(){
        
            //this._player.body.velocity.x = 10;
            //this._player.body.velocity.y = 10;
      

    }


    private showTreasure(obj1: Sprite, obj2: Sprite) {
        var obj1hasOverlapped: Boolean;
        var obj2hasOverlapped: Boolean;

        if(!obj1hasOverlapped && !obj2hasOverlapped){
            obj1hasOverlapped = obj2hasOverlapped = true;
            this.treasure.visible = true;
            console.log("collided");
            //this.treasure.visible = true;
        
            this.time.events.add(Phaser.Timer.SECOND * 4, this.hideTreasure, this);
        }

        console.log("collided");
        //this.treasure.visible = true;
        
        this.time.events.add(Phaser.Timer.SECOND * 4, this.hideTreasure, this);
        //this.add.tween(this.treasure).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    
    }

    private hideTreasure(){
        this.treasure.visible=false;
    }
    private CreatePlayer()
    {
        if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
            this._player = this.add.sprite(0, 0, 'ninjaleft');
        }
        if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
            this._player = this.add.sprite(0, 0, 'girlright');
        }
        
       
        this.physics.enable(this._player, Phaser.Physics.ARCADE);
        this.physics.arcade.enableBody(this._player);
        this._player.body.collideWorldBounds = true;


        



        var unit = (<HTMLInputElement>document.getElementById("myName")).value;    
        if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
            var name = this.game.add.text(this._player.x, this._player.y, unit, {font:'15px Arial', fill: '#0024ff', align: 'center'});
        }
        if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
            var name = this.game.add.text(this._player.x, this._player.y, unit, {font:'15px Arial', fill: '#ff00de', align: 'center'});
        }
        
        name.anchor.set(0.5)
        this._player.addChild(name);
       
        
    }

    private OnSocketConnected()
    {
        console.log("OnSocketConnected: connected to server");
        this.CreatePlayer();
        GameProperties.InGame = true;
        var unit = (<HTMLInputElement>document.getElementById("myName")).value; 
        if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
            var thesprite = 'ninjaleft';
        }
        if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
            var thesprite = 'girlright';
        }
        // Send the server our initial position and tell it we are connectedthis._socket.
        this._socket.emit("new_player", { x: 0, y: 0, angle: 0, username: unit, mysprite: thesprite });
    }

    private OnNewPlayer(data: { id: string, x: number, y: number, username: string, angle: number, mysprite: string })
    {
        //if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
        //   var mysprite: string = "ninjaleft";
        //}
        //if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
        //    var mysprite: string = "girlright";
       //}
        let newEnemy = new RemotePlayer(data.id, data.x, data.y, data.username, data.angle, data.mysprite, this);
        console.log("1newEnemy" + data.x, data.y);
        
        this._enemyList.push(newEnemy);
    }

    // Server tells us there is a new enemy movement. We find the moved enemy
    // and sync the enemy movement with the server
    private OnEnemyMove(data: { id: string, x: number, y: number, angle: number })
    {
        var movePlayer = this.FindEnemyById(data.id);

        if (!movePlayer)
        {
            return;
        }
        movePlayer.player.x = data.x
        movePlayer.player.y = data.y
        //movePlayer.player.body.x = data.x;
        //movePlayer.player.body.y = data.y;
        movePlayer.player.angle = data.angle;
        //console.log(data.x);
        //console.log("Move player");
    }

    // When the server notifies us of client disconnection, we find the disconnected
    // enemy and remove from our game
    private OnRemovePlayer(data: { id: string })
    {
        console.log("OnRemovePlayer");
        var removePlayer = this.FindEnemyById(data.id);
        // Player not found
        if (!removePlayer)
        {
            console.log('Player not found: ', data.id)
            return;
        }

        removePlayer.player.destroy();
        this._enemyList.splice(this._enemyList.indexOf(removePlayer), 1);
    }

    private FindEnemyById(id: string): RemotePlayer
    {
        for (var i = 0; i < this._enemyList.length; i++)
        {
            if (this._enemyList[i].id == id)
            {
                return this._enemyList[i];
            }
        }

        return null;
    }
}
