var game = {};
module.exports = game;

game.wall = new Wall();
game.discards = [];
game.discarded = null;
game.players = [];
game.turn = 0;
game.started = false;


game.addPlayer = function(playerID){
    game.players.push(
        new Player(playerID)
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
    var tile = game.players[data.playerID].hand.splice(data.tileIndex, 1);
    if(game.discarded === null){
        game.discarded = tile[0];
    }
    else {
        game.discards.push(game.discarded);
        game.discarded = tile[0];
    }
    return game.checkHands(tile[0]);
};

game.checkHands = function(tile){
    for(var i = 0; i < game.players.length; i++){
        if(game.players[i].checkPung(tile)) {
            return i;
        }
    }
};

game.pickup = function(data){
    if(game.discarded){
        game.players[data.playerID].hand.push(game.discarded);
        game.discarded = null;
    }
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
        this.wall[this.wall.length] = new Tile("flower", j);
        this.wall[this.wall.length] = new Tile("season", j);
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
    console.log(tile);
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
// Player.prototype.roll = function(){
//     var roll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
//     console.log(roll);
//     return roll;
// };
