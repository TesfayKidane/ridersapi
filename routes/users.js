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
    }
    else{
      console.log('user saved to database')
      res.send(result);
    }
  })
});

router.get('/byId/:id', function (req, res, next) {
    db.collection('users').findOne({"_id": ObjectId(req.params.id)}, function (err, doc) {
        if (err) {
            console.log('Error fetching data from mongodb');
            res.send(err)
        }
        console.log(doc);
        res.json(doc);
    });
});

module.exports = router;
