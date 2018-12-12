//creating the deck using objects 
var face = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
var suits = ['Clubs','Spades','Diamonds','Hearts'];
var deck = new Array();
var socket = io();


function createDeck(){
    deck = new Array();
    for (var i=0;i<face.length;i++){
        for (var j=0;j<suits.length;j++){
            var weight = parseInt(face[i]);
            if (face[i]=='A'){
                weight = 11;
            }
            if (face[i]=='T' || face[i]=='J'||face[i]=='Q'||face[i]=='K'){
                weight = 10;
            }
            var card = {Face:face[i],Suit:suits[j],Value:weight};
            deck.push(card);
        }
    }
}

function updateDeck()
{
    document.getElementById('deckcount').innerText = deck.length;
    console.log(deck.length);
}

function shuffle(){
        
    for (var i = 0; i < 1000; i++){
        var x = Math.floor((Math.random() * deck.length));
        var y = Math.floor((Math.random() * deck.length));
        var tmp = deck[x];

        deck[x] = deck[y];
        deck[y] = tmp;
    }
}

var players = new Array();
function newPlayer(noOfPlayers){
    players = new Array();
    for (var i=1;i<=noOfPlayers;i++){
        var hand = new Array();
        var player = {Name: `Player ${i}`,ID:i,Points:0,Hand:hand};
        players.push(player);
    }
}


function newPlayersDisplay()
{
    document.getElementById('players').innerHTML = '';
    for(var i = 0; i < players.length; i++)
    {
        var div_player = document.createElement('div');
        var div_playerid = document.createElement('div');
        var div_hand = document.createElement('div');
        var div_points = document.createElement('div');

        div_points.className = 'points';
        div_points.id = 'points_' + i;
        div_player.id = 'player_' + i;
        div_player.className = 'player';
        div_hand.id = 'hand_' + i;

        div_playerid.innerHTML = 'Player ' + players[i].ID;
        div_player.appendChild(div_playerid);
        div_player.appendChild(div_hand);
        div_player.appendChild(div_points);
        document.getElementById('players').appendChild(div_player);
    }


}

function deal()
{
    // alternate handing cards to each player
    // 2 cards each
    for(var i = 0; i < 2; i++)
    {
        for (var x = 0; x < players.length; x++)
        {
            var card = deck.pop();
            players[x].Hand.push(card);
            renderCard(card, x);
            updatePoints();
        }
    }

    updateDeck();
}

var playerNo;
$('#initial').submit(function(e){
    e.preventDefault();

    playerNo = e.target.playerCount.value;

    startGame(playerNo);

    var socket = io();
    socket.emit('start',playerNo);

    return false;
})

function startGame(players){

    // e.preventDefault();
    document.getElementById('btnStart').value = 'Restart';
    document.getElementById('status').style.display="none";

    currentPlayer = 0;
    createDeck();
    shuffle();
    newPlayer(players);
    newPlayersDisplay();
    deal();
    document.getElementById('player_' + currentPlayer).classList.add('active');
    socket.emit('savestate',players);
    
}


function renderCard(card, player)
{
    var hand = document.getElementById('hand_' + player);
    hand.appendChild(getCardDisplay(card));
}

function getCardDisplay(card)
{
    var el = document.createElement('div');
    var icon = '';
    if (card.Suit == 'Hearts')
    icon='&hearts;';
    else if (card.Suit == 'Spades')
    icon = '&spades;';
    else if (card.Suit == 'Diamonds')
    icon = '&diams;';
    else
    icon = '&clubs;';
    
    el.className = 'card';
    el.innerHTML = card.Face + '<br/>' + icon;
    return el;
}

// returns the number of points that a player has in hand
function getPoints(player)
{
    var points = 0;
    for(var i = 0; i < players[player].Hand.length; i++)
    {
        points += players[player].Hand[i].Value;
    }
    players[player].Points = points;
    return points;
}

function updatePoints()
{
    for (var i = 0 ; i < players.length; i++)
    {
        getPoints(i);
        document.getElementById('points_' + i).innerHTML = players[i].Points;
    }
}

function check()
{
    if (players[currentPlayer].Points > 21)
    {
        document.getElementById('status').innerHTML = 'Player: ' + players[currentPlayer].ID + ' LOST';
        document.getElementById('status').style.display = "inline-block";
        stay();
        socket.emit('bust',[currentPlayer,players[currentPlayer-1].Points]);
    }
}

function hit()
{
    // pop a card from the deck to the current player
    // check if current player new points are over 21
    var card = deck.pop();
    players[currentPlayer].Hand.push(card);
    renderCard(card, currentPlayer);
    updatePoints();
    updateDeck();
    check();
    socket.emit('hit',[currentPlayer,card]);
}

function doubleDown()
{
    // pop a card from the deck to the current player
    // check if current player new points are over 21
    var card = deck.pop();
    players[currentPlayer].Hand.push(card);
    renderCard(card, currentPlayer);
    updatePoints();
    updateDeck();
    check();
    stay();
}

function end()
{
    var winner = -1;
    var score = 0;

    for(var i = 0; i < players.length; i++)
    {
        if (players[i].Points > score && players[i].Points < 22)
        {
            winner = i;
        }
        score = players[i].Points;
    }

    document.getElementById('status').innerHTML = 'Winner: Player ' + players[winner].ID;
    document.getElementById("status").style.display = "inline-block";
}


function stay()
{
    // move on to next player, if any

    socket.emit('stay',[currentPlayer,players[currentPlayer].Points]);
    if (currentPlayer != players.length-1) {
        document.getElementById('player_' + currentPlayer).classList.remove('active');
        currentPlayer += 1;
        document.getElementById('player_' + currentPlayer).classList.add('active');
    }

    else {
        end();
    }
}






