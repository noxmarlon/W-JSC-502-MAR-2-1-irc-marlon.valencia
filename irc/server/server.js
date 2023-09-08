/**
 * Modules
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/**
 * list of all users
 */
var users = [];

var deleteUsers = [];

function getUserByRoom(room) {
    var usersRoom = [];

    for (var i in users) {
        if (users[i].room.name == room) {
            usersRoom.push(users[i]);
        }
    }

    return usersRoom;
}

/**
 * 
 */
function searchUser(user) {
    for (var i in users) {
        if (users[i].name == user.name) {
            return i;
        }
    }

    return -1;
}

/**
 * 
 */
function searchUserByName(username) {
    for (var i in users) {
        if (users[i].name == username) {
            return users[i];
        }
    }

    return null;
}

/**
 * 
 */
function searchUserById(id) {
    for (var i in users) {
        if (users[i].id == id) {
            return users[i];
        }
    }

    return null;
}

/**
 * Check if user is unique 
 */
function userIsUnique(nameUser) {
    var unique = true;

    for (var i in users) {
        if (users[i].name == nameUser) {
            unique = false;
        }
    }

    return unique;
}

/**
 * 
 */
function deleteUser(user) {
    for (var i in users) {
        if (users[i].name == user.name) {
            users.splice(i, 1);
        }
    }
}

/**
 * Contains all rooms
 */
var rooms = [
    {
        owner: 'Admin',
        name: 'Lobby',
        state: 'Unlock'
    }
];

var roomAutoDelete = 5000;

function beetween(value, min, max) {
    return (value < min || value > max) ? false : true;
}

/**
 * 
 */
function searchRoom(NameRoom) {
    for (var key in rooms) {
        if (NameRoom == rooms[key].name) {
            return key;
        }
    }

    return -1;
}

function CountUsersInRoom(RoomName) {
    var count = 0;

    for (var i in users) {
        if (users[i].room.name == RoomName) {
            count++;
        }
    }

    return count;
}

/**
 * Listen if a connection is made on the socket
 */
io.on('connection', function (socket) {
    /**
    * Current user
    */
    socket.user = {
        id: socket.id,
        name: "Unknow",
        room: rooms[0],
        logged: false
    }

    users.push(socket.user);

    /**
     * 
     */
    function changeUsername(username) {
        if (typeof (username) == "string") {
            if (!userIsUnique(username)) {
                sendErrorMessage('L\'utilisateur n\'est pas unique');
                return false;
            }

            if (!beetween(username.length, 3, 9)) {
                sendErrorMessage('La taille du pseudo doit faire entre 3 et 9 caracteres');
                return false;
            }
            var user = searchUserById(socket.id);

            if (user) {
                user.name = username;
                return true;
            }
        }

        return false;
    }

    /**
     * Init all users
     */
    function InitUsers() {
        for (var i in users) {
            if (users[i] != null) {
                if (users[i].name != "Unknow" && users[i].name != socket.user.name) {
                    socket.emit('newUser', users[i].name);
                }
            }
        }
    }

    /**
     * 
     */
    function resetUsers() {
        for (var i in users) {
            if (users[i] != null) {
                if (users[i].name != "Unknow" && users[i].name != socket.user.name) {
                    socket.emit('deleteUser', users[i].name);
                }
            }
        }
    }

    function InitChannels() {
        for (var i in rooms) {
            socket.emit('addRoom', rooms[i].name);
        }
    }

    /**
     * 
     */
    function deleteRoom(theRoom) {
        if (!theRoom || typeof (theRoom) !== 'string') {
            sendErrorMessage('Le channel est invalide');
            return false;
        }

        var index = searchRoom(theRoom);

        if (index !== -1) {
            if (rooms[index].owner !== socket.user.name) {
                sendErrorMessage('Tu n\'es pas le proprietaire de ce channel');
                return false;
            } else {
                rooms.splice(index, 1);
                return true;
            }
        }

        sendErrorMessage('Le channel n\'existe pas');
        return false;
    }

    /**
     * 
     */
    socket.on('addRoom', function (room) {
        socket.emit('addRoom', room);
    });

    /**
     * 
     */
    socket.on('CommandCreate', function (theRoom = []) {
        theRoom = theRoom.toString().replace(",", " ");

        if (typeof (theRoom) == 'string' && beetween(theRoom.length, 4, 15)) {
            if (searchRoom(theRoom) > -1) {
                sendErrorMessage('Ce channel existe déjà');
                return false;
            }

            rooms.push({
                owner: socket.user.name,
                name: theRoom,
                state: 'Unlock'
            });

            allSendBotMessage("<FONT COLOR ='#fff'>" + socket.user.name + "</FONT>" + " vient de creer le channel  <FONT COLOR ='#ff9200'>" + theRoom + "</FONT>");
        } else {
            sendErrorMessage('Le channel est invalide');
        }
    });

    /**
     * 
     */
    socket.on('CommandDelete', function (targetRoom = []) {
        var theRoom = targetRoom.toString().replace(",", " ");
        if (deleteRoom(theRoom)) {
            allSendBotMessage("<FONT COLOR ='#08E0AF'>" + socket.user.name + "</FONT>" + " vient de supprimer le channel <FONT COLOR ='#ff9200'>" + theRoom + "</FONT>");
            io.to(theRoom).emit('RedirectDelete');
        }
    });

    /**
     * 
     */
    socket.on('CommandChange', function (theRooms = []) {
        if (typeof (theRooms[0]) !== "string" || typeof (theRooms[1]) !== "string") {
            return false;
        }

        var index = searchRoom(theRooms[0]);

        if (index === -1) {
            sendErrorMessage('Le channel n\'existe pas');
            return;
        }

        if (rooms[index].owner !== socket.user.name) {
            sendErrorMessage('Tu n\'es pas le proprietaire de ce channel');
        }
        
        rooms[index].name = theRooms[1];
        allSendBotMessage("<FONT COLOR ='#08E0AF'>" + socket.user.name + "</FONT>" + " vient de changer le channel <FONT COLOR ='#dc8019'>" + theRooms[0] + "</FONT>" + " en " + "<FONT COLOR ='#dc8019'>" + theRooms[1] + "</FONT>");
    });

    /**
     * 
     */
    socket.on('RedirectDelete', function () {
        var room = socket.user.room.name;

        JoinRoom('Lobby');

        deleteUsers.push(socket.user.name);

        if (!getUserByRoom(room)[0]) {
            sendBotMessage("Un groupe de " + deleteUsers.length + " personne(s) vient de rejoindre le channel:", deleteUsers);
            deleteUsers = [];
        }
    });


    /**
     * 
     */
    function JoinRoom(targetRoom = [], message = "") {
        targetRoom = targetRoom.toString().replace(",", " ");

        var indexRoom = searchRoom(targetRoom);
        var indexUser = searchUser(socket.user);

        if (indexRoom > -1 && indexUser > -1) {
            socket.leave(socket.user.room.name);
            socket.user.room = rooms[indexRoom];
            users[indexUser] = socket.user;
            socket.join(socket.user.room.name);
            if (message != "") {
                sendBotMessage(message);
            }
            return true;
        }

        sendErrorMessage('Room inexistante');
        return false;
    }

    /**
     * 
     */
    function sendErrorMessage(message) {
        socket.emit('error message', message);
    }

    /**
     * 
     */
    function sendBotMessage(message, tab = [], color = "#08E0AF", test = false) {
        io.to(socket.user.room.name).emit(
            'chat message', "Bot_IRC [<FONT COLOR ='#fff'>" + socket.user.room.name + "</FONT>]",
            message,
            color,
            tab
        );
    }

    function sendPrivateMessage(username, msg, color = "#08E0AF", tab = []) {
        var user = searchUserByName(username);

        if (user) {
            io.sockets.connected[user.id].emit('chat message', socket.user.name + " [<FONT COLOR = '#ffee00'>message privé</FONT>]", msg, color, tab);
            socket.emit('chat message', '<FONT COLOR = "#ffee00">à </FONT>' + user.name, msg, color, tab);
        }
    }

    /**
     * 
     */
    function allSendBotMessage(message, tab = [], color = "#08E0AF") {
        io.emit('chat message', "Bot_IRC [<FONT COLOR ='#99ff66'>Tous</FONT>]", message, color, tab);
    }

    /**
     * 
     */
    function localSendBotMessage(message, tab = [], color = "#08E0AF") {
        socket.emit('chat message', "Bot_IRC [<FONT COLOR ='#ffee00'>Privé</FONT>]", message, color, tab);
    }

    /**
     * Join a room
     */
    socket.on('CommandJoin', function (targetRoom = "") {
        JoinRoom(targetRoom, "<FONT COLOR ='#fff'>" + socket.user.name + "</FONT> vient de rejoindre le channel");
    });

    /**
     * Leave current room and join lobby
     */
    socket.on('CommandLeave', function (targetRoom = "") {
        var oldRoom = socket.user.room.name;

        if (JoinRoom("Lobby",
            "<FONT COLOR ='#fff'>" + socket.user.name + "</FONT> vient de rejoindre le channel")) {
            socket.broadcast.to(oldRoom).emit(
                'chat message', "Bot_IRC [<FONT COLOR ='#dc8019'>" + oldRoom + "</FONT>]",
                "<FONT COLOR ='#fff'>" + socket.user.name + "</FONT> a quitté le channel pour rejoindre le " + "<FONT COLOR ='#ff9200'> lobby</FONT>",
                '#08E0AF'
            );
        }
    });

    /**
     * 
     */
    socket.on('CommandUsers', function () {
        var theUsers = getUserByRoom(socket.user.room.name).filter((user) => user.logged == true);
        var test = [];

        for (var i in theUsers) {
            test.push(theUsers[i].name);
        }

        if (test) {
            localSendBotMessage("Liste des utilisateurs présents sur le channel:",
                test);
        }
    });

    /**
     * 
     */
    socket.on('CommandWhere', function (usernames = []) {
        if (!usernames[0]) {
            localSendBotMessage("Tu es actuellement dans le canal <FONT COLOR ='#dc8019'>" + socket.user.room.name + "</FONT>");
            return;
        }

        var user = searchUserByName(usernames[0]);

        if (!user) {
            localSendBotMessage("L'utilisateur " + usernames[0] + " est introuvable");
            return;
        }

        localSendBotMessage(user.name + " ce trouve dans le canal <FONT COLOR ='#dc8019'>" + user.room.name + "</FONT");
    });

    /**
     * 
     */
    socket.on("CommandList", function (options = []) {
        var result = [];

        var j = 0;
        for (var i in rooms) {
            if (!options[0]) {
                result[j] = rooms[i].name;
                j++;
            } else if (rooms[i].name.indexOf(options[0]) != -1) {
                result[j] = rooms[i].name;
                j++;
            }
        }

        localSendBotMessage("Liste des canaux disponibles:", result);
    });

    /**
     * 
     */
    socket.on("CommandNick", function (options = []) {
        var oldName = socket.user.name;

        if (changeUsername(options.toString().replace(",", " "))) {
            allSendBotMessage("<FONT COLOR ='#fff'>" + oldName + "</FONT>" + " vient de changer son pseudo en " + "<FONT COLOR ='#fff'>" + socket.user.name + "</FONT>");
            io.emit('initUsers', users.filter((user) => user.logged === true));
        }
    });

    /**
     * 
     */
    socket.on('CommandMsg', function (options) {
        if (options.length >= 2) {
            var user = searchUserByName(options[0]);

            if (user) {
                console.log(msg, options)
                var msg = options.filter((item) => item !== options[0]).join(' ');
                sendPrivateMessage(user.name, msg);
            } else {
                sendErrorMessage('Utilisateur introuvable');
            }
        } else {
            sendErrorMessage('La commande prend deux parametres');
        }
    });

    /**
     * 
     */
    socket.on('chat message', function (msg) {
        io.to(socket.user.room.name).emit('chat message', socket.user.name, msg, color = "#fff");
    });

    /**
     * 
     */
    socket.on('login', function (username) {
        if (socket.user.logged === false && changeUsername(username)) {
            socket.emit('logged', username);
            InitUsers();
            InitChannels();
            JoinRoom(socket.user.room.name, "<FONT COLOR ='#fff'>" + username + "</FONT> vient de rejoindre le channel");
            io.emit('newUser', username);
            socket.user.logged = true;
        }
    });

    /**
     * 
     */
    socket.on('disconnect', function () {
        if (socket.user.name != "Unknow") {
            io.emit('removeUser', socket.user.name);
            sendBotMessage("<FONT COLOR ='#fff'>" + socket.user.name + "</FONT> est parti");
            deleteUser(socket.user);
            socket.user.name = "Unknow";
            socket.user.room = rooms[0];
        }
    });
});

/**
 * 
 */
io.listen(3001, function () {
    console.log('listening on *:3009');
});