/// <reference path="./libs/phaser.d.ts" />


import * as io from "socket.io-client";

import { GameProperties } from "./GameProperties";

import { PlayerHelper } from "./PlayerHelper";
import { RemotePlayer } from "./RemotePlayer";


export class Level extends Phaser.State
{
    private _socket: SocketIOClient.Socket;
    private _player: Phaser.Sprite;
    private _enemyList: RemotePlayer[] = [];
   
   
  
    public preload()
    {
        this.stage.disableVisibilityChange = true;
        this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.world.setBounds(
            0, 0,
            GameProperties.GameWidth, GameProperties.GameHeight);
        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.setBoundsToWorld(false, false, false, false);
        this.physics.p2.gravity.y = 0;
        this.physics.p2.applyGravity = false;
        this.physics.p2.enableBody(this.physics.p2.walls, false);
        this.load.image("background", "./images/background1.jpg");
        this.load.image("ninjaleft", "./images/ninjaleft.png");
        this.load.image("girlright", "./images/girlright.png");
        this.load.image("treasure", "./images/treasure.png" )
       
        
        
        
        // change for git
        // change for git
        // physics start system
        //game.physics.p2.setImpactEvents(true);
    }
    
    public create()
    {
        this._socket = io.connect();
        this.add.image(0,0,"background")
        //this.add.tileSprite(0, 0, 1500, this.game.cache.getImage('background').height, 'background');
        console.log("client started");
       
        this._socket.on("connect", () => { this.OnSocketConnected(); });
        
        // Listen to new enemy connections
        this._socket.on("new_enemyPlayer",
            (data: { id: string, x: number, y: number, username: string, angle: number }) =>
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
   
        if (this._player.x >520 && this._player.x <530  && this._player.y >420 && this._player.y <430){
            this.add.tileSprite(525 - (this.game.cache.getImage('treasure').width/2), 425 - (this.game.cache.getImage('treasure').height/2), this.game.cache.getImage('treasure').width, this.game.cache.getImage('treasure').height, 'treasure');
            this.time.events.add(Phaser.Timer.SECOND * 4, this.fadePicture, this);
        } 
        
        }
        //console.log(this._player.x, this._player.y);
        this._socket.emit('move_player', { x: this._player.x, y: this._player.y, angle: this._player.angle });

    }
        
    }
    private fadePicture() {

        this.add.tween('treasure').to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
    
    }
    private CreatePlayer()
    {
        if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
            this._player = this.add.sprite(0, 0, 'ninjaleft');
        }
        if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
            this._player = this.add.sprite(0, 0, 'girlright');
        }
        
        this.physics.p2.enableBody(this._player, true);
        this._player.body.clearShapes();
        var unit = (<HTMLInputElement>document.getElementById("myName")).value;    
        if ((<HTMLInputElement>document.getElementById("nsprite")).checked){
            var name = this.game.add.text(this._player.x, this._player.y-40, unit, {font:'15px Arial', fill: '#0024ff', align: 'center'});
        }
        if ((<HTMLInputElement>document.getElementById("nrsprite")).checked){
            var name = this.game.add.text(this._player.x, this._player.y-40, unit, {font:'15px Arial', fill: '#ff00de', align: 'center'});
        }
        
        name.anchor.set(0.5)
        this._player.addChild(name);//this._player.body.data.shapes[0].sensor = true;
        
    }

    private OnSocketConnected()
    {
        console.log("OnSocketConnected: connected to server");
        this.CreatePlayer();
        GameProperties.InGame = true;
        var unit = (<HTMLInputElement>document.getElementById("myName")).value; 
        // Send the server our initial position and tell it we are connectedthis._socket.
        this._socket.emit("new_player", { x: 0, y: 0, angle: 0, username: unit });
    }

    private OnNewPlayer(data: { id: string, x: number, y: number, username: string, angle: number })
    {
        // Enemy object
        let newEnemy = new RemotePlayer(data.id, data.x, data.y, data.username, data.angle, this);
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
