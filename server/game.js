var game = {};
module.exports = game;

game.wall = new Wall();
game.discards = [];
game.discarded = null;
game.players = [];
game.turn = 0;
game.started = false;


game.addPlayer = function(position){
    game.players.push(
        new Player(position)
    );
};

 game.startGame = function(){
     if(!game.started){
         game.started = true;
         game.wall.dealTiles();
         game.giveTile();
         game.players[game.turn].turn = true;
     }
};

game.nextTurn = function(){
    game.players[game.turn].turn = false;
    game.turn = (game.turn+1)%4;
    game.players[game.turn].turn = true;
    game.giveTile();
};

game.giveTile = function(){
    game.players[game.turn].draw.push(game.wall.drawTile());
};

game.discard = function(data){
    if(data.suit){
        var tile = game.players[data.position].draw.pop();
        if(game.discarded === null){
            game.discarded = tile;
        }
        else {
            game.discards.push(game.discarded);
            game.discarded = tile;
        }
        var actions = {
            eats: game.checkEats(tile)
        };
        return actions;
    }
    else {
        var handTile = game.players[data.position].hand.splice(data.tileIndex, 1);
        if(game.discarded === null){
            game.discarded = handTile[0];
        }
        else {
            game.discards.push(game.discarded);
            game.discarded = handTile[0];
        }
        game.players[data.position].hand.push(game.players[data.position].draw.pop());
        var actions = {
            eats: game.checkEats(handTile[0]),
            pung: game.checkPungs(handTile[0])
        };
        return actions;
    }
};
// Checking arbitrary order because only possible pung
game.checkPungs = function(tile){
    for(var i = 0; i < game.players.length; i++){
        if(game.players[i].checkPung(tile)) {
            return i;
        }
    }
};

game.checkEats = function(tile){
    var nextPlayer = (game.turn+1)%4;
    return game.players[nextPlayer].checkEat(tile);
};

game.pickup = function(data){
    console.log(data);
    if(game.discarded){
        game.players[data.position].hand.push(game.discarded);
        game.discarded = null;
    }
    game.turn = data.position;
};

//Tile Class
function Tile (suit, value){
    this.suit = suit;
    this.value = value;
}


//Wall Class
function Wall() {
    this.wall = [];
    for(var j = 1; j <= 4; j++){
        for(var i = 1; i <= 9; i++){
            this.wall[this.wall.length] = new Tile('aspot', i);
            this.wall[this.wall.length] = new Tile('bamboo', i);
            this.wall[this.wall.length] = new Tile('char', i);
        }
        this.wall[this.wall.length] = new Tile("dnorth", null);
        this.wall[this.wall.length] = new Tile("deast", null);
        this.wall[this.wall.length] = new Tile("dsouth", null);
        this.wall[this.wall.length] = new Tile("dwest", null);
        this.wall[this.wall.length] = new Tile("emiddle", null);
        this.wall[this.wall.length] = new Tile("eprosperity", null);
        this.wall[this.wall.length] = new Tile("ewhite", null);
        // this.wall[this.wall.length] = new Tile("flower", j);
        // this.wall[this.wall.length] = new Tile("season", j);
    }
}

Wall.prototype.shuffle = function(){
    var m = this.wall.length, t, i;

    while(m){
        i = Math.floor(Math.random() * m--);
        t = this.wall[m];
        this.wall[m] = this.wall[i];
        this.wall[i] = t;
    }
    return this.wall;
};
Wall.prototype.dealTiles = function(){
    game.wall.shuffle();
    for(var j = 0; j < 4; j ++){
        for(var idx = 0; idx < game.players.length; idx++){
            for(var i = 1; i <= 4; i++){
                game.players[idx].hand.push(this.wall.pop());
            }
        }
    }
};
Wall.prototype.drawTile = function(){
    return this.wall.pop();
};




//Player Class
function Player(playerID){
    this.name = playerID;
    this.hand = [];
    this.draw = [];
    this.turn = false;
}
Player.prototype.drawTile = function(){
    this.hand.push(newWall.wall.pop());
};
Player.prototype.discard = function(index){
    var discard = this.hand.splice(index, 1);
    if(this.hand.length){
        newDiscard(discard[0]);
    }
};
Player.prototype.sortBy = function (key, minor) {
return function (o, p) {
    var a, b;
    if (o && p && typeof o === 'object' && typeof p === 'object') {
        a = o[key];
        b = p[key];
        if (a === b) {
            return typeof minor === 'function' ? minor(o, p) : 0;
        }
        if (typeof a === typeof b) {
            return a < b ? -1 : 1;
        }
        return typeof a < typeof b ? -1 : 1;
        }
    };
};
Player.prototype.sortHand = function(){
    this.hand.sort(this.sortBy('suit', this.sortBy('value')));
};
Player.prototype.checkPung = function(tile){
    var count = 0;
    for(var idx = 0; idx < this.hand.length; idx++){
        if(this.hand[idx].suit == tile.suit && this.hand[idx].value == tile.value){
            count++;
        }
    }
    if (count == 2) {
        return true;
    }
    else {
        return false;
    }
};
Player.prototype.checkEat = function(tile){
    var runs = [];
    for(var idx = 0; idx < this.hand.length; idx++){
        if(tile.value-1 == this.hand[idx].value && tile.suit == this.hand[idx].suit){
            if(this.hand[idx-1] && tile.value-2 == this.hand[idx-1].value && tile.suit == this.hand[idx-1].suit){
                runs.push(this.hand[idx-1], this.hand[idx], tile);
            }
            if(this.hand[idx+1] && tile.value+1 == this.hand[idx+1].value && tile.suit == this.hand[idx+1].suit){
                if(!this.hasValue(runs, this.hand[idx].value)){
                    runs.push(this.hand[idx]);
                }
                if(!this.hasValue(runs, tile.value)){
                    runs.push(tile);
                }
                if(!this.hasValue(runs, this.hand[idx+1].value)){
                    runs.push(this.hand[idx+1]);
                }
                if(this.hand[idx+2] && tile.value+2 == this.hand[idx+2].value && tile.suit == this.hand[idx+2].suit){
                    if(!this.hasValue(runs, this.hand[idx+2].value)){
                        runs.push(this.hand[idx+2]);
                    }
                    break;
                }
            }
        }
        else if (tile.value+1 == this.hand[idx].value && tile.suit == this.hand[idx].suit){
            if(this.hand[idx+1] && tile.value+2 == this.hand[idx+1].value && tile.suit == this.hand[idx].suit){
                runs.push(tile, this.hand[idx], this.hand[idx+1]);
            }
        }
    }
    return runs;
};
Player.prototype.hasValue = function(arr, value){
    for(var idx = 0; idx < arr.length ; idx++){
        if(arr[idx].value == value){
            return true;
        }
    }
};
// Player.prototype.roll = function(){
//     var roll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
//     console.log(roll);
//     return roll;
// };
