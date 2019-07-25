var socketIO = require('socket.io');
var db = require('./db');

function connect(server) {
  const io = socketIO(server);
  
  // TODO: Create namespaces
  usersNamespace(io);
}

// TODO: List namespace will provide list of logged in users
function usersNamespace(io) {
  const users = io.of('/users');
  users.on('connection', socket => {
    
    socket.on('start-chat', (toUser, fromUser) => {
      if (toUser) {
        users.in(toUser.email).emit('start-chat', fromUser);
      }
    })
    
    // TODO: add listener to chat message
    socket.on('new-message', (data) => {
      socket.in(data.toUser.email).emit('new-message', data.message);
    });

    // TODO: add listener for editor message WYSIWIG

    // TODO: add listener for drawing

    // ogging in, update flag loggedIn in Database, join room
    socket.on('login', user => {
      socket.join(user.email);

      db.getClient().collection("students").findOneAndUpdate(
        {email: user.email},
        {$set: {'loggedIn': true}},
        {returnOrigignal: false},
        function(err, results) {
          if (err) {
            socket.emit('list error', err);
          } else if (results.value == null) {
            socket.emit('list error', {error: "Student with email " })
          } else {
            users.emit('logged in', results.value);
          }
        }
      );
    })

    // listener on 'disconnect' to log out user, and emit
    socket.on('disconnect', user => {
      socket.leave(user.email);

      db.getClient().collection("students").findOneAndUpdate(
        {email: user.email},
        {$set: {'loggedIn': false}},
        {returnOrigignal: false},
        function(err, results) {
          if (err) {
            socket.emit('list error', err);
          } else if (results.value == null) {
            socket.emit('list error', {error: "Student with email " })
          } else {
            users.emit('logged out', results.value);
          }
        }
      );
    })

    // listener for logout message, update db, emit
    socket.on('logout', user => {
      socket.leave(user.email);

      db.getClient().collection("students").findOneAndUpdate(
        {email: user.email},
        {$set: {'loggedIn': false}},
        {returnOrigignal: false},
        function(err, results) {
          if (err) {
            socket.emit('list error', err);
          } else if (results.value == null) {
            socket.emit('list error', {error: "Student with email " })
          } else {
            users.emit('logged out', results.value);
          }
        }
      );
    })  

    // listener to search query
    socket.on('query', (params, fn) => {
      const textCriteria = { $text: { $search: params.search } };
      const learningTargetCriteria = { learningTargets: params.search };
      const criteria = {$or: [textCriteria, learningTargetCriteria]};
      db.getClient().collection("students").find(criteria).sort({loggedIn: -1}).toArray(function(err, results) {
        if (err) {
          console.log('err', err);
          socket.emit('list error', err);
        } else {
          console.log('results', results);
          fn(results);
        }
      });
    })
  });


}

module.exports = {
  connect,
}
