var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var db

MongoClient.connect('mongodb://rider:rider2017@ds145208.mlab.com:45208/ridersdb', function(err, database){
  if (err) return console.log(err)
  db = database  
})

router.get('/', function(req, res, next) {
      db.collection('events').find().toArray(function(err, doc){
          if(err) {
              console.log('Error fetching data from mongodb');
              res.send(err)
            }
        //   db.close();   
          //console.log(doc);   
          res.json(doc);      
      });
});

router.post('/addevent', (req, res) => {
  db.collection('events').save(req.body, (err, result) => {
    if (err) {
         console.log(err);
         res.send(err);
    }
    console.log('saved to database')
    res.send(result);
  })
})

module.exports = router;