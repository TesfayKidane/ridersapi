var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var db

MongoClient.connect('mongodb://rider:rider2017@ds145208.mlab.com:45208/ridersdb', function(err, database){
  if (err) return console.log(err)
  db = database  
})
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/adduser', (req, res) => {
  db.collection('users').save(req.body, (err, result) => {
    if (err) {
         console.log(err);
         res.send(err);
    } else{
        console.log('user saved to database')
        res.send(result);
    }
  })
})

module.exports = router;
