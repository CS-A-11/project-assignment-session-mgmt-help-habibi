let express = require('express');
let router = express.Router();
let passport = require('passport');
let Account = require('../models/Account');
let Message = require('../models/Message');
let Order = require('../models/Order');
let moment = require('moment');
let  bcrypt = require('bcryptjs');






/////////////////////////////////////////////
let multer = require('multer');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/")
    },
    filename: (req, file, cb) => {

        const [fileName, fileExt] = file.originalname.split('.')
        console.log("Savinf file:", file);

        cb(null, file.fieldname + '-' + Date.now() + "." + fileExt);
    }
});

let upload = multer({ storage: storage });

/////////////////////////////////////////////



router.get('/register', function (req, res) {
    res.render('register', { layout: "client-layout.handlebars", isUser: false });
});

router.post('/register', function (req, res) {
    let firstname = req.body.first_name;
    let lastName = req.body.last_name;
    let email = req.body.username;
    let password = req.body.password;

    Account.register(new Account({ username: email, fName: firstname, lName: lastName }), password, function (err, account) {
        if (err) {
            console.log(err);
            return res.render('register', { account: account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


router.get('/login', function (req, res) {
    res.render('login', { user: req.user, layout: "client-layout.handlebars", isUser: req.user ? true : false ,isCorrect:true});
});
router.get('/loginFailed', function (req, res) {
    res.render('login', { user: req.user, layout: "client-layout.handlebars", isUser: req.user ? true : false ,isCorrect:false});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/client/client-dashboard',
    failureRedirect: '/client/loginFailed',
    // failureFlash: true
}), function (req, res) {
    //  res.redirect('/');
   // res.redirect('client-dashboard');

});
 
router.get('/forgot', function (req, res) {
    res.render('forgotpassword.handlebars', { user: req.user, layout: "client-layout.handlebars",isUser:false});
});
//fp_email
router.post('/forgot', function (req, res) {
    let email = req.body.fp_email;
    console.log("Email forgot",req.body.fp_email);
    Account.findOne({ 'username': email }, function (err, person) {
        if (person===null) {
            console.log('Email not found');

        }else{
        // console.log('Email found',person);
        let id = person._id;
        id+="";
        finalHash="";
        console.log("printing the id:",id);
        bcrypt.hash(id, 1).then(function(hashh) {
            console.log('Final hash id:',hashh);

            finalHash +=hashh;
        });
        bcrypt.hash(email, 10).then(function(hash) {
            finalHash +=hash;
            
        console.log('Final hash:',finalHash);
      
        });
     
        }
      });

    res.render('forgotpassword.handlebars', { user: req.user, layout: "client-layout.handlebars",isUser:false});
});

router.use(function (req, res, next) {
    if (req.user && !req.user.isAdmin) {
        next();
        return;
    }
    res.redirect('/client/login');
});


router.get('/chat/:id', function (req, res) {


    let msgs = Message.find({ "orderID": req.params.id }).then(messages => {
        for (let i = 0; i < messages.length; i++) {
            Message.update({
                _id: messages[i]._id,
                byClient: "Admin"

            }, { isRead: true }, function (err, raw) {
                if (err) { console.log("Error updating") }
                else {
                    // res.redirect('admin-dashboard');
                    console.log("Result", raw);

                }
            })
        }

        res.render('chat.handlebars', {
            layout: "client-layout.handlebars", isUser: true, _id: req.params.id, messages,
            helpers: {
                is: function (arg1, arg2, options) {
                    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
                }
            }
        });
    })


})

router.post('/chat/:id', function (req, res) {
    console.log("send button pressed");
    messageTextbox = req.body.message;
    byClient = "Client"
    orderID = req.params.id;
    time = moment().valueOf();
    let formattedTime = moment(time).format('h:mm a');

    let msg = new Message({
        body: messageTextbox,
        byClient: byClient,
        orderID: orderID,
        createdAt: formattedTime
    })

    msg.save().then(() => {
        console.log("Message:", msg)
        res.redirect(orderID);
    });


})

router.get('/client-dashboard', async function (req, res) {

    let username = req.user.username;
    let orders = await Order.find({ "username": username });
    for (let i = 0; i < orders.length; i++) {
        let messages = await Message.find({ orderID: orders[i]._id, byClient: "Admin", isRead: false });
        // orders[i] = Object.assign({'ary': messages.length}, orders[i]);
        o = orders[i];
        o = Object.assign({
            _id: o._id,
            title: o.title,
            deadline: o.deadline,
            subject: o.subject,
            coupon: o.coupon,
            details: o.details,
            username: o.username,
            status: o.status,
            budget: o.budget,
            __v: o.__v,
            unread: messages.length,
            files: o.files
        });
        orders[i] = o;
    }
    console.log(JSON.stringify(orders));
    res.render('temp.handlebars', {
        layout: "client-layout.handlebars", isUser: true, orders: orders,
        helpers: {
            get: function (obj, prop) {
                return obj[prop];
            }
        }
    });

    // res.json(orders);

});


router.get('/order', function (req, res, next) {
    res.render('order.handlebars', { title: 'New Order', layout: "client-layout.handlebars", isUser: true });

});

router.post('/savefile/:id', upload.single('file'), function (req, res, next) {
    if (typeof req.file == "undefined") {
        return;
    }
    id = req.params.id;

    // res.status(JSON.stringify( req));
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
    res.redirect('/client/client-dashboard')
    return;
});
// router.get('/download/:file', function (req, res) {
//     console.log("File req:",req);
//     console.log("File req:",res);

//     var file = "./public/uploads/file-1532771232560.jpg";
//     res.download(file); // Set disposition and send it.
// });

router.post('/order', upload.single('file'), function (req, res, next) {


    let email = req.body.name; title = req.body.title; deadline = req.body.deadline;
    let subject = req.body.subject; let coupon = req.body.coupon; let details = req.body.details;
    let _status = "Under review"
    let _budget = req.body.budget;

    let file = '';
    if (typeof req.file == "undefined") {
        file = '';

    }
    else {
        file = '/uploads/' + req.file.filename;
    }

    let newOrder = new Order({
        title: title,
        deadline: deadline,
        subject: subject,
        coupon: coupon,
        details: details,
        username: req.user.username,
        status: _status,
        budget: _budget,
        files: [file]
    });
    newOrder.save().then(() => {
        //Upload file
        res.redirect('client-dashboard');
    });
});

router.get('/changePassword', function (req, res) {
    res.render('client-changepassword.handlebars', { title: 'Change Password', layout: "client-layout.handlebars", isUser: true });

})

router.post('/changePassword', function (req, res, next) {
    let password = req.body.password1;
    let email = req.user.username;
    //console.log("Requestish:",email);
    //   res.redirect('changePassword');
    Account.findByUsername(email).then(function (sanitizedUser) {
        if (sanitizedUser) {
            sanitizedUser.setPassword(password, function () {
                sanitizedUser.save();
                res.redirect('client-dashboard');
            });
        } else {
            res.status(500).json({ message: 'This user does not exist' });
        }
    }, function (err) {
        console.error(err);
    })
})

router.get('/ping', function (req, res) {
    if (req.user) {
        return res.status(200).send("Logged in");
    }
    else {
        res.status(200).send("Logged out!");
    }
});


// server.listen(3001, () => {
//     console.log(`Server is up on `);
//   });

module.exports = router;
