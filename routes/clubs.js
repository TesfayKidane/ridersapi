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
})

router.get('/byId/:id', function(req, res, next) {
      console.log('Club request for : ' + req.params.id);
      var obj = {myClub: '', myAnnounce: '', myMembers: ''};
      db.collection('clubs').findOne({"_id":  ObjectId(req.params.id) },function(err, doc){
          if(err) {
              console.log('Error fetching data from mongodb');
              res.send(err)
            }
          // res.json(doc);  

        //   test
        obj.myClub = doc;
        
            var arr =[];
            console.log(doc.announcementIds);
            for( var i in doc.announcementIds ) {
                arr.push(ObjectId(doc.announcementIds[i]));
            }

            var arrMembers =[];
            console.log(doc.userIds);
            for( var i in doc.userIds ) {
                arrMembers.push(doc.userIds[i]);
            }
            
            db.collection('announcement').find({_id: {$in: arr}}).toArray(function(err, docs){
                if(err) {
                    res.send(err)
                  }
                  obj.myAnnounce = docs;
                
                //users
                    
                    db.collection('users').find({_id: {$in: arrMembers}}).toArray(function(err, docm){
                        if(err) {
                            res.send(err)
                        }
                        obj.myMembers = docm;
                        res.json(obj);                      
                    });
                //end users                    
            });
        // end test


      });
});

router.post('/addUser', (req, res) => {
        var clubId = req.body["clubId"];
        var userId = req.body["userId"];
        db.collection("clubs").update(
            {"_id":  ObjectId(clubId) },  {$addToSet: {userIds:userId }}, (e, r) => {
            if(e){
                console.log(e);
                res.send(e);
            }
            console.log('saved to database');
        res.send(r);
        })
});

module.exports = router;