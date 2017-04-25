var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var db

MongoClient.connect('mongodb://rider:rider2017@ds145208.mlab.com:45208/ridersdb', function(err, database){
  if (err) return console.log(err)
  db = database  
})

router.get('/', function(req, res, next) {
      db.collection('clubs').find().toArray(function(err, doc){
          if(err) {
              console.log('Error fetching data from mongodb');
              res.json(err)
            }
        //   db.close();   
          console.log(doc);   
          res.json(doc);      
      });
});

router.post('/addclub', (req, res) => {
  db.collection('clubs').save(req.body, (err, result) => {
    if (err) {
         console.log(err);
         res.send(err);
    }
    console.log('saved to database');
    res.send(result.ops);
  })
})

router.get('/:id', function(req, res, next) { 
      console.log('Club request for : ' + req.params.id);
      db.collection('clubs').findOne({"_id":  ObjectId(req.params.id) },function(err, doc){
          if(err) {
              console.log('Error fetching data from mongodb');
              res.send(err)
            }
          res.json(doc);      
      });
});

router.get('/:id', function(req, res, next) {
      db.collection('clubs').findOne({"_id":  ObjectId(req.params.id) },function(err, doc){
          if(err) {
              console.log('Error fetching data from mongodb');
              res.send(err)
            }
          res.json(doc);      
      });
});

module.exports = router;