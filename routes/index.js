var express = require('express');
var router = express.Router();
var Proof = require('../models/Proof');


router.get('/', function(req, res, next) {
  let isUser = false;
      if (req.user) 
        isUser = true;
  res.render('index', { layout:"client-layout.handlebars", title: 'Help Habibi' ,isUser:isUser});
});

router.get('/services', function(req, res, next) {
  let isUser = false;
  if (req.user) 
  isUser = true;
  res.render('services', { title: 'Help Habibi',  layout:"client-layout.handlebars",isUser:isUser  });
});

router.get('/about', function(req, res, next) {
  let isUser = false;
  if (req.user) 
  isUser = true;
  res.render('about', { title: 'About us',  layout:"client-layout.handlebars",isUser:isUser });
});

router.get('/pricing', function(req, res, next) {
  res.render('pricing', { title: 'Help Habibi' });
});

router.get('/guarantees', function(req, res, next) {
  let isUser = false;
  if (req.user) 
  isUser = true;
  res.render('guarantees', { title: 'Guarentees',layout:"client-layout.handlebars",isUser:isUser });
});

// router.get('/order', function(req, res, next) {
//   res.render('order.handlebars', { title: 'Help Habibi' });
// });

// router.post('/order', function(req, res, next) {
//   res.render('order.handlebars', { title: 'Help Habibi' });
// });

router.get('/proves',async function(req, res, next) {
   let proofs = await Proof.find();
   
  for (let i = 0; i < proofs.length; i++) {
  
       o = proofs[i];
       dets=(trimDetails(o.details))
           o = Object.assign({
          _id: o._id,
          title: o.title,
           subject: o.subject,          
          details:dets,         
          __v: o.__v,
           files: o.files
      });
      proofs[i] = o;
     // console.log("Proof of workd:",proofs[i])
  }

  let isUser = false;
  if (req.user) 
  isUser = true;
   res.render('proves.handlebars', {
     layout:"client-layout.handlebars",
        isUser: isUser, proofs: proofs,
      helpers: {
          get: function (obj, prop) {
              return obj[prop];
          }
      }
  });

  //res.render('proves.handlebars', { title: 'Help Habibi' });
});



function trimDetails(str)
{
  console.log("Trimming");
  var string = str;
var length = 150;
var trimmedString = string.length > length ? 
                    string.substring(0, length - 3) + "..." : 
                    string;

                    return trimmedString;
}


module.exports = router;
