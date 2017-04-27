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
        delete req.body["clubLat"];
        delete req.body["clubLng"];
        db.collection('clubs').save(req.body, (err, result) => {
          if (err) {
              console.log(err);
              res.send(err);
          }else{
          console.log('saved to database');
          res.send(result.ops);
          }
        })
});

router.get('/getnearby', function(req, res, next){
  console.log(req.query);
  db.collection('clubs').find({'loc':{
    $nearSphere: {
           $geometry: {
              type : "Point",
              coordinates : [parseFloat(req.query.lng), parseFloat(req.query.lat)]
           },
           $maxDistance: 10000
        }
  }}).toArray(function(e, r){
    if(e)console.log(e);
    console.log(r);
    res.json(r);
  });
})


router.get('/byId/:id', function(req, res, next) {
      console.log('Club request for : ' + req.params.id);
      db.collection('clubs').findOne({"_id":  ObjectId(req.params.id) },function(err, doc){
          if(err) {
              console.log('Error fetching data from mongodb');
              res.send(err)
            }
          res.json(doc);      
      });
});


module.exports = router;