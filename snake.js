(function(){
  
  var currentGame = null;
  var firstGame = true;
  var paused = false;

  function Game(board){
    currentGame = this;
    this.board = board;
    this.snake = new Snake(this);
    this.cellWidth = 10;
    this.dimensions = {x: board.width() / 20,
                       y: board.height() / 20 };
    this.cellNum = 20;
    this.apples = [];
    this.generateApples();
    this.score = 0;
    
    if(firstGame){
      this.listenForPause();
      firstGame = false;
    }
  }
  
  Game.prototype.listenForPause = function(){
    $("body").on("keydown", function(event){
        if( event.keyCode == 32 ){
          console.log(paused);
          if (paused == true){
            currentGame.startLoop();
            $("#paused").hide();
            paused = false;
          } else if ( currentGame.intervalId ) {
            clearInterval(currentGame.intervalId);
            $("#paused").show();
            paused = true;
          }
        }
    });
  },

  Game.prototype.drawBoard = function(){
    var $board = this.board;
    var width = this.cellWidth;
    $board.empty();
    for(var row = 0; row < 20; row++){
      for(var column = 0; column < 20; column++){
        $cell = $('<div class="cell"></div>');
        $cell.addClass("row" + row);
        $cell.addClass("col" + column);
        $board.append($cell);
      }
    };

   //$('#board').find('.row0').filter('.col0').css('background-color', 'red');
  };
  
  Game.prototype.reset = function(){
    this.board.empty();
    var game = new Game(this.board);
    $("#score").html("0");
    $("#game-over").hide();
    game.drawBoard();
    game.snake.draw();
    game.drawApples();
    game.initLooping();  
  };

  Game.prototype.step = function(){
    //this.drawBoard();
    this.snake.move();
    var lose = this.snake.checkLoss();
    if(!lose){
      this.snake.draw();
    } else{
      return false;
    }
    var eaten = this.checkApples();
    if(!eaten){
      this.snake.deleteTail();
    }
    this.drawApples();

    return true;
  };

  Game.prototype.checkApples = function(){
    var eaten = false;
    var apples = this.apples;
    for(var i = 0; i < apples.length; i++){
      var apple = apples[i];
      if(apple.isEaten()){
        delete apple;
        // should pull score out into step
        this.score++;
        $("#score").html(this.score);
        apples[i] = Apple.generateRandomApple(this);
        eaten = true;
      }
    }
    return eaten;
  };

  Game.prototype.drawApples = function(){
    var apples = this.apples;
    for(var i = 0; i < apples.length; i++){
      var apple = apples[i];
      apple.draw();
    }
  };

  Game.prototype.start = function(){
    var that = this;
    this.drawBoard();
    this.snake.draw();
    this.drawApples();
    var sToStart = function(event){
      if(event.keyCode == 83){
        $("#message").empty();
        that.initLooping();
        $("body").off("keydown", sToStart); 
      } 
    };
    $("body").on("keydown", sToStart);
  };
  
  Game.prototype.initLooping = function(){
    this.startLoop();
  };
  
  Game.prototype.startLoop = function(){
    var that = this;
    var intervalId = window.setInterval(function(){
      var go = that.step();
      if(!go){
        clearInterval(intervalId);
        $("#game-over").show();
        $("#message").html("hit r to restart the game");
        var rToRestart = function(event){
          if(event.keyCode == 82){
            $("#message").empty();
            that.reset();
            $("body").off("keydown", rToRestart); 
          } 
        };
        $("body").on("keydown", rToRestart);    
      }
    }, 100);
    this.intervalId = intervalId;
  },

  Game.prototype.generateApples = function(){
    for(var i = 0; i < 3; i++){
      this.apples.push(Apple.generateRandomApple(this));
    }
  }

  function Snake(game){
    var that = this;
    this.body = [{x: 0, y: 0}];
    this.direction = {x: 1, y: 0};
    this.game = game;
    this.apples = 0;
    // this.game.board.click(function(event){
//       that.turn("south");
//       console.log("hello there");
//     });
    // console.log(this.game.board.keydown);
    $('html').keydown(function(event){
      console.log("we have registered an event.");
      console.log(event.keyCode);
      switch(event.keyCode){
      case 37:
        that.turn("west");
        break;
      case 38:
        that.turn("north");
        break;
      case 39:
        that.turn("east");
        break;
      case 40:
         that.turn("south");
         break;
      }
    });

  }

  Snake.prototype.head = function(){
    return this.body[this.body.length - 1];
  }

  Snake.prototype.checkLoss = function(){
    var body = this.body;
    var headSeg = this.head();
    var lose = false;
    for(var i = 0; i < body.length - 1; i++){
      var segment = body[i];
      if (headSeg.x === segment.x && headSeg.y === segment.y){
        lose = true;
        var cell = this.game.board
                             .find(".row" + segment.y)
                             .filter(".col" + segment.x);
        cell.css('background-color', 'orange');
      }
    }
    if(headSeg.x < 0 ||
       headSeg.y < 0 ||
       headSeg.x === this.game.dimensions.x ||
       headSeg.y === this.game.dimensions.y){
         lose = true;
         var previousPosition = this.body[this.body.length - 2];
         var cell = this.game.board
                              .find(".row" + previousPosition.y)
                              .filter(".col" + previousPosition.x);
         
         cell.css('background-color', 'orange');
       }  
    return lose;
  };

  Snake.prototype.move = function(){
    var currentHead = this.head();
    console.log(this.direction);
    var newHead = {x: currentHead.x + this.direction.x,
                 y: currentHead.y + this.direction.y};
    this.body.push(newHead);
  };

  Snake.prototype.deleteTail = function(){
    var segment = this.body.shift();
    var cell = this.game.board
                         .find(".row" + segment.y)
                         .filter(".col" + segment.x);
    cell.css('background-color', 'white');
  };

  Snake.prototype.turn = function(direction){
    console.log(direction==="south");
    switch(direction){
    case "south":
      this.direction = {x: 0, y: 1};
      break;
    case "north":
      this.direction = {x: 0, y: -1};
      break;
    case "east":
      this.direction = {x: 1, y: 0};
      break;
    case "west":
      this.direction = {x: -1, y: 0};
      break;
    }
  };

  Snake.prototype.draw = function(direction){
    for(var i = 0; i < this.body.length; i++){
      var segment = this.body[i];
      var cell = this.game.board
                           .find(".row" + segment.y)
                           .filter(".col" + segment.x);
      cell.css('background-color', 'red');
    }
  };

  function Apple(xPos, yPos, game){
    this.position = {x: xPos, y: yPos};
    this.game = game;
  }

  Apple.generateRandomApple = function(game){
    var xPos = Math.floor(Math.random() * game.dimensions.x);
    var yPos = Math.floor(Math.random() * game.dimensions.y);
    return new Apple(xPos, yPos, game);
  };

  Apple.prototype.draw = function(){
    var position = this.position;
    var cell = this.game.board
                         .find(".row" + position.y)
                         .filter(".col" + position.x);
    cell.css('background-color', 'blue');
  };

  Apple.prototype.isEaten = function(){
    var snakeBody = this.game.snake.body;
    var eaten = false;
    for(var i = 0; i < snakeBody.length; i++){
      segment = snakeBody[i];
      position = this.position;
      if(segment.x === position.x && segment.y === position.y){
       eaten = true;
      }
    }
    return eaten;
  };





  window.Game = Game;
})();



$(function(){
  new Game($('#board')).start();
});