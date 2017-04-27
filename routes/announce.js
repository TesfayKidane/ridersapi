var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var db

MongoClient.connect('mongodb://rider:rider2017@ds145208.mlab.com:45208/ridersdb', function(err, database){
  if (err) return console.log(err)
  db = database  
})

router.post('/addannounce', (req, res) => {
    console.log(req.body);
    var clubId = req.body.clubId;
    delete req.body["clubId"];
  db.collection('announcement').save(req.body, (err, result) => {
    if (err) {
         console.log(err);
         res.send(err);
    }
    var announceId = result.ops[0]._id.toString();
    db.collection("clubs").update(
        {"_id":  ObjectId(clubId) },  {$addToSet: {announcementIds: announceId }}, (e, r) => {
            if(e){
                console.log(e);
                res.send(e);
            }
            console.log('saved to database');
            res.send(result.ops);
        })
  })
})

router.get('/byClub/:id', function(req, res, next) {
      let club;
      db.collection('clubs').findOne({"_id":  ObjectId(req.params.id) },function(err, doc){
          if(err) {
              console.log('Error fetching data from mongodb');
              res.send(err)
            }
            var arr =[];
            console.log(doc.announcementIds);
            for( var i in doc.announcementIds ) {
                arr.push(ObjectId(doc.announcementIds[i]));
            }
            
            db.collection('announcement').find({_id: {$in: arr}}).toArray(function(err, doc){
                if(err) {
                    res.send(err)
                  }
                res.json(doc);      
            });
      });
      
      
});

module.exports = router;