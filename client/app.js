var app = new Vue({
    el: "#app",
    
    data: {
        myPlayer: {
            id: 0,
            alive: true,
            position: {x: 0, y: 0},
            rotation: 0
        },

        enemies: [],

        missiles: [],

        can_fire: true
    },

    methods: {
        move: function () {
            app.myPlayer.position.x += 10 * Math.cos(app.myPlayer.rotation * Math.PI / 180);
            app.myPlayer.position.y += 10 * Math.sin(app.myPlayer.rotation * Math.PI / 180);
        },

        rotateRight: function () {
            app.myPlayer.rotation += 360/16;
        },

        rotateLeft: function () {
            app.myPlayer.rotation -= 360/16;
        },

        fire: function () {
            if (app.can_fire && app.myPlayer.alive) {
                socket.send(JSON.stringify({type: "fire", data: app.myPlayer}));
                app.can_fire = false;
                setTimeout(function () {
                    app.can_fire = true;
                }, 1000)
            }
        },

        updateEnemies: function () {

        }
    }
})


var socket = new WebSocket('ws://star-fighter-server.herokuapp.com');

socket.onmessage = function (message) {
    var data = JSON.parse(message.data);
    if (data.type == "start") {
        app.myPlayer.id = data.data.id;
    } else if (data.type == "update") {

        app.enemies = [];
        app.missiles = [];

        data.data.players.forEach(function (enemy) {
            if (enemy.id !== app.myPlayer.id) {
                app.enemies.push(enemy);
            } else {
                if (enemy.alive == undefined) {
                    app.myPlayer.alive = true;
                } else {
                    app.myPlayer.alive = enemy.alive;
                    if (!app.myPlayer.alive) {
                        playerObject = document.querySelector("#myPlayer");
                        app.myPlayer = {id: app.myPlayer.id, alive: true, position: {x: 0, y: 0}, rotation: 0};
                    }
                }
            }
        })

        data.data.missiles.forEach(function (missile) {
            app.missiles.push(missile);
        })
    }
};

socket.onopen = function () {
    socket.send(JSON.stringify({type: "start"}));
    playerObject = document.querySelector("#myPlayer");
};

socket.onclose = function () {
    socket.send(JSON.stringify(app.myPlayer.id));
};

function pressed(e) {
    var key_code=e.which||e.keyCode;

    if (key_code == 37) {
        app.rotateLeft();
    } else if (key_code == 39) {
        app.rotateRight();
    }

    if (key_code == 38) {
        app.move();
    }

    if (key_code == 40) {
        app.fire();
    }
}

setInterval(function () {
    var playerObject = document.getElementById("myPlayer");
    playerObject.style.transform = "translate(" + (window.innerWidth/2 - app.myPlayer.position.x) + "px ," + (window.innerHeight/2 - app.myPlayer.position.y) + "px ) rotate(" + (app.myPlayer.rotation + 90) + "deg)";

    var data = {type: "update", data: {id: app.myPlayer.id, alive: app.myPlayer.alive, position: {x: app.myPlayer.position.x, y: app.myPlayer.position.y, z: app.myPlayer.position.z}, rotation: app.myPlayer.rotation}};
    socket.send(JSON.stringify(data));

    app.enemies.forEach(function (enemy) {
        var enemyObject = document.getElementById(enemy.id + "id");
        enemyObject.style.transform = "translate(" + (window.innerWidth/2 - enemy.position.x) + "px ," + (window.innerHeight/2 - enemy.position.y) + "px ) rotate(" + (enemy.rotation + 90) + "deg)";
    })

    app.missiles.forEach(function (missile) {
        var missileObject = document.getElementById(missile.id + "id");
        missileObject.style.transform = "translate(" + (window.innerWidth/2 - missile.position.x) + "px ," + (window.innerHeight/2 - missile.position.y) + "px ) rotate(" + (missile.rotation + 90) + "deg)";
        missileObject.style.display = "block";
    })
}, 100);