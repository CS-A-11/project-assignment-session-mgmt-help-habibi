const express = require('express');
var Order = require('../models/Order');

const router = express.Router();
var moment = require('moment');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var Account = require('../models/Account');
var Message = require('../models/Message');

/////////////////////////////////////////////
let multer = require('multer');
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

let upload = multer({ storage: storage });

router.post('/savefile', upload.single('file'), function (req, res, next) {
console.log("Save files")
// res.status(JSON.stringify( req));
console.log("Im on: save files:",req.file.filename, "With id:",roomID);
let file = '/uploads/' + req.file.filename;
return;
});
/////////////////////////////////////////////
var roomID = "null";
server.listen(4000);

// socket io
io.on('connect', (socket) => {
  console.log('New User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('room', function (room) {
    roomID = room;
    socket.join(room);
    console.log("Room#", room);
  });

  socket.on('newMessage', (data) => {
    console.log("New Message Recieved", data);
    messageTextbox = data.body;
    byClient = "Client"
    orderID = data.id; //?
    time = moment().valueOf();
    var formattedTime = moment(time).format('LLLL');

    var msg = new Message({
      body: messageTextbox,
      byClient: byClient,
      orderID: orderID,
      createdAt: formattedTime,
      isRead: false,
      isAttachement: false
      // timestamp:time
    })

    msg.save().then(() => {
      console.log("Message:", msg)

      io.sockets.in(orderID).emit('render', msg);

    });
  })

  function helperMsgSave(data) {
    filename = data.filename;
    byClient = "Client";
    orderID = data.id;
    time = moment().valueOf();
    var formattedTime = moment(time).format('LLLL');
    console.log("orderid:", orderID);
    var msg = new Message({
      body: filename,
      byClient: byClient,
      orderID: orderID,
      createdAt: formattedTime,
      isRead: false,
      isAttachement: true
      // timestamp:time
    })
    return msg;
  }

  function helperOrderUpdate(data) {
    Order.update(
      { "_id": data.id },
      {
        "$push":
        {
          "files": filename

        }
      }
      , function (e, r) {

      }
    )
  }

  socket.on('ClientAttachementMessage', (data) => {
    
    console.log("Attachcment client")
    msg = helperMsgSave(data);
    helperOrderUpdate(data);
    router.post('/savefile');
    msg.save().then(() => {
      console.log("Message:", msg)
      io.sockets.in(orderID).emit('render', msg);
    })

  })
  socket.on('newMessageAdmin', (data) => {
    console.log("New Message Recieved from Admin", data);
    messageTextbox = data.body;
    byClient = "Admin"
    orderID = data.id; //?
    time = moment().valueOf();
    var formattedTime = moment(time).format('LLLL');
    var msg = new Message({
      body: messageTextbox,
      byClient: byClient,
      orderID: orderID,
      createdAt: formattedTime,
      isRead: false,
      isAttachement: false

    })

    msg.save().then(() => {
      console.log("Message from Adm:", msg)
      io.to(orderID).emit("render", msg);
    });
  })

  socket.on('AdminRead', (data) => {
    //if data is by client, then mark his/her message as read.
    Message.update({
      _id: data._id,
      byClient: "Client"

    }, { isRead: true }, function (err, raw) {
      if (err) { console.log("Error updating") }
      else {
        // res.redirect('admin-dashboard');
        console.log("Result", raw);

      }
    })
  })

  socket.on('ClientRead', (data) => {
    //if data is by client, then mark his/her message as read.
    Message.update({
      _id: data._id,
      byClient: "Admin"

    }, { isRead: true }, function (err, raw) {
      if (err) { console.log("Error updating") }
      else {
        // res.redirect('admin-dashboard');
        console.log("Result", raw);

      }
    })
  })


});
function hi(msg) {

}
module.exports = router;