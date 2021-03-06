var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var db

MongoClient.connect('mongodb://rider:rider2017@ds145208.mlab.com:45208/ridersdb', function (err, database) {
    if (err) return console.log(err)
    db = database
})

router.get('/', function (req, res, next) {
    db.collection('events').find().toArray(function (err, doc) {
        if (err) {
            console.log('Error fetching data from mongodb');
            res.send(err)
        }
        res.json(doc);
    });
});

router.get('/byId/:id', function (req, res, next) {
    console.log('Event request for : ' + req.params.id);
    db.collection('events').findOne({"_id": ObjectId(req.params.id)}, function (err, doc) {
        if (err) {
            console.log('Error fetching data from mongodb');
            res.send(err)
        }
        res.json(doc);
    });
});

router.post('/addevent', (req, res) => {
    console.log(req.body);
var clubId = req.body.clubId;
delete req.body["clubId"];
db.collection('events').save(req.body, (err, result) => {
    if (err) {
        console.log(err);
        res.send(err);
    }
    var announceId = result.ops[0]._id.toString();
db.collection("clubs").update(
    {"_id":  ObjectId(clubId) },  {$push: {eventIds: announceId }}, (e, r) => {
    if(e){
        console.log(e);
        res.send(e);
    }
    console.log('saved to database');
res.send(result.ops);
})
})
})

router.get('/byClub/:id', function (req, res, next) {
    let club;
    db.collection('clubs').findOne({"_id": ObjectId(req.params.id)}, function (err, doc) {
        if (err) {
            console.log('Error fetching data from mongodb');
            res.send(err)
        }
        var arr =[];
        for( var i in doc.eventIds ) {
            arr.push(ObjectId(doc.eventIds[i]));
        }

        db.collection('events').find({_id: {$in: arr}}).toArray(function (err, doc) {
            if (err) {
                res.send(err)
            }
            res.json(doc);
        });
    });


});

router.post('/adduser', (req, res) => {
    console.log(req.body);
    var eventId = req.body["eventId"];
    var userId = req.body["userId"];
    console.log(eventId + ' -- ' + userId);
    db.collection("events").update(
        {"_id":  ObjectId(eventId) },  {$addToSet: {eventUserIds:userId }}, (e, r) => {
            if(e){
                console.log(e);
                res.send(e);
            }
            console.log('saved to database');
            res.send(r);
        });
});

module.exports = router;