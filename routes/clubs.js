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
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyAQWOM1SESY4y3lMmhAUo-4LiFbNj_hqSM', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

router.post('/addclub', (req, res, next) => {

geocoder.geocode({address: req.body.clubPostCode}, function(err, ans) {
  if(err) return next(err);
  console.log(ans);
  var lat=ans[0].latitude;
  var lng=ans[0].longitude;
  req.body.loc={type:'Point', coordinates:{lng:parseFloat(lng), lat:parseFloat(lat)}}
  console.log(req.body);
  db.collection('clubs').insert(req.body, (err, result) => {
    if (err) {
         console.log(err);
         return next(err);
    }
    console.log('saved to database');
    res.send(result);
  })

});
  
})
//"{"_id":"590021dcdbe09c30137cd9ea","clubName":"test last","clubCity":"sasas",
//"clubState":"Alaska","clubPostCode":52557,"clubImage":"","clubOwnerId":1,
//"loc":{"type":"Point","coordinates":{"lat":41.0182103,"lng":-91.97041689999999}}}"
router.get('/getnearby', function(req, res, next){

  /*db.collection('clubs').ensureIndex({"loc": "2dsphere"}, {name: "index2dSphereLocation1"}, function(error, indexName){
    if(error)console.log(error + " index error");
    console.log(indexName);
  });
  db.collection('clubs').ensureIndex({"loc": "2d"}, {name: "index2dLocation1"}, function(error, indexName){
    if(error)console.log(error + " index error");
    console.log(indexName);
  });*/
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