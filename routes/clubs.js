var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyAQWOM1SESY4y3lMmhAUo-4LiFbNj_hqSM', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

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

      // db.collection('clubs').aggregate(

      //     [{$project:{clubName:1, clubState:1, clubPostCode:1, clubImage:1, totalUsers:{$size:"$userIds"}}},  

      //     ]).toArray(function(err, doc){
      //     if(err) {
      //         console.log('Error fetching data from mongodb');
      //         res.json(err)
      //       }
      //     console.log(doc);   
      //     res.json(doc);      
      // });
});
    
    
router.post('/addclub', (req, res) => {

var address = req.body.clubPostCode;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        var lat = results[0].geometry.location.lat();
        var lng = results[0].geometry.location.lng();
        var obj = {type: "Point", coordinates: [lat, lng]};
        req.body.loc = obj;
        console.log(req.body);
        db.collection('clubs').save(req.body, (err, result) => {
          if (err) {
              console.log(err);
              res.send(err);
          }
          console.log('saved to database');
          res.send(result.ops);
        })
        
      }
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

// router.get('/:id', function(req, res, next) {
//       db.collection('clubs').findOne({"_id":  ObjectId(req.params.id) },function(err, doc){
//           if(err) {
//               console.log('Error fetching data from mongodb');
//               res.send(err)
//             }
//           res.json(doc);      
//       });
// });

module.exports = router;