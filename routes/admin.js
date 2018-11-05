
var express = require('express');
var router = express.Router();
const JSON = require('circular-json');
var passport = require('passport');
var Account = require('../models/Account');
var Message = require('../models/Message');
var Proof = require('../models/Proof');

var Order = require('../models/Order');
var htmlTable = require('helper-html-table');
Handlebars= require('handlebars');
var moment = require('moment');

var Engine = require('engine');
var engine = new Engine();
engine.helper('htmltable', htmlTable);
 

/////////////////////////////////////////////
let multer = require('multer');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/")

    },
    filename: (req, file, cb) => {

        const [fileName, fileExt] = file.originalname.split('.')
        console.log("Savinf file:", file);

        cb(null, file.fieldname + '-submission-' + Date.now() + "." + fileExt);
    }
});

let upload = multer({ storage: storage });

/////////////////////////////////////////////



router.get('/register', function(req, res) {
    res.render('admin-register', { });
    console.log("Admin registeration page")
});
router.post('/register', function(req, res) {
    var firstname = req.body.first_name;
    var lastName = req.body.last_name;
    var email = req.body.username;
    var password = req.body.password;
    var isAdmin = false;
    
    Account.register(new Account({username:email,fName:firstname,lName:lastName,isAdmin}), password, function(err, account) {
     
       if (err) {
            console.log(err);
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            req.logout;
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('admin-login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    
  if(req.user.isAdmin===false){
      res.redirect('/admin/logout');
  }
  else{
  console.log("is admin:TRUE ");
     res.redirect('admin-dashboard');
  }
});
router.use(function (req, res, next) {
    if(req.user && req.user.isAdmin) {
        next();
        return;
    }
    res.redirect('/admin/login');
});
router.post('/select/:id',function(req, res) {
    id = req.params.id;
    console.log("Selected option:",req.body.Selection);
    Order.update({_id:id},{status:req.body.Selection},function(err,raw){
        if(err)
        {console.log("Error updating")}
        else{
            res.redirect('/admin/admin-dashboard');
        }
    })

  });

  router.post('/updateBudget/:id',function(req, res) {
    id = req.params.id;
    console.log("Budget updated to!",req.body.newB);
    Order.update({_id:id},{budget:req.body.newB},function(err,raw){
        res.redirect('/admin/admin-dashboard');

    })
    // console.log("Selected option:",req.body.Selection);
    // Order.update({_id:id},{status:req.body.Selection},function(err,raw){
    //     if(err)
    //     {console.log("Error updating")}
    //     else{
    //         res.redirect('admin-dashboard');
    //     }
    // })

//   });
  }  )
router.get('/admin-chat/:id',function(req,res){
  
    var msgs = Message.find({ "orderID": req.params.id }).then(messages => {
        for(let i=0; i<messages.length;i++)
        {
           Message.update({
               _id:messages[i]._id,
               byClient:"Client"
           
           },{isRead:true},function(err,raw){
               if(err)
               {console.log("Error updating")}
               else{
                   // res.redirect('admin-dashboard');
                   console.log("Result",raw);
                  
               }
           })
       }

   res.render('admin-chat.handlebars', { layout: "admin-layout.handlebars", _id: req.params.id, messages, helpers: {
    is: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
} });
})
    
})

router.post('/admin-chat/:id',function(req,res){
    console.log("send button pressed");
    messageTextbox=req.body.message;
    byClient = "Admin"
    orderID = req.params.id;
    time = moment().valueOf();
   
    var msg = new Message({body: messageTextbox,
    byClient:byClient,
    orderID:orderID,
    createdAt: time
   })

   msg.save().then(() => {
    console.log("Message:",msg)
    res.redirect(orderID);
});})








router.get('/admin-dashboard',async function(req, res) {
        user = req.user;
        console.log("USER ID:",user.isAdmin);

     let orders = await Order.find();
    for (let i = 0; i < orders.length; i++) {
        let messages = await Message.find({orderID: orders[i]._id, byClient: 'Client', isRead: false});
        // orders[i] = Object.assign({'ary': messages.length}, orders[i]);
        o = orders[i];
        o = Object.assign({
            _id:o._id,
            title:o.title,
            deadline:o.deadline,
            subject:o.subject,
            coupon:o.coupon,
            details:o.details,
            username:o.username,
            status:o.status,
            budget:o.budget,
            __v:o.__v,
            unread:messages.length,
            files:o.files
        });
        orders[i] =o;
        //orders[i].ary = messages.length;
    }
    res.render('admin-dashboard.handlebars', {layout:"admin-layout.handlebars",orders:orders });

 });

 
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/order', function(req, res, next) {
    res.render('order.handlebars', { title: 'Help Habibi' });

  });
  

router.get('/ping', function(req, res){
    if(req.user)
    {
        return res.status(200).send("Logged in");
    }
    else{
    res.status(200).send("Logged out!");
    }
});

router.post('/savefile/:id', upload.single('file'), function (req, res, next) {
    console.log("Save files Admin")
    id = req.params.id;
    let name = req.file;
    if(typeof req.file == "undefined")
    {
        return;
    }

    // res.status(JSON.stringify( req));
    console.log("Im on: save files:", req.file.filename, "With id:", id);
    let file = '/uploads/' + req.file.filename;
    Order.update(
        { "_id": id },
        {
            "$push":
            {
                "files": file

            }
        }
        , function (e, r) {

        }
    )
    res.redirect('/admin/admin-dashboard')
    return;
});

router.get('/uploadwork', function(req, res){
    console.log("At proof");
    res.render('admin-proofForm.handlebars', { title: 'Help Habibi' });

});

router.post('/uploadwork', upload.single('file'), function (req, res, next) {


    let   title = req.body.title;  
    let subject = req.body.subject;   let details = req.body.details;
     
   

    let file = '';
    if (typeof req.file == "undefined") {
        file = '';

    }
    else {
        file = '/uploads/' +req.file.filename;
    }

    let newProof = new Proof({
        title: title,
         subject: subject,
         details: details,
         files: [file]
    });
    newProof.save().then(() => {
        //Upload file
        res.redirect('admin-dashboard');
    });
});

module.exports = router;
