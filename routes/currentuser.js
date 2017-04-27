/**
 * Created by Tesfay on 4/25/2017.
 */
var MongoClient = require('mongodb').MongoClient;

module.exports = function(req) {
    return new Promise(function (res, rej) {
        const token = req.headers['token'];
        const email = req.headers['email'];
        MongoClient.connect('mongodb://rider:rider2017@ds145208.mlab.com:45208/ridersdb', function(err, db){
            if (err) return console.log(err);
            db.collection('users').findOne({'token': token,'email': email },function(err, doc){
                if(err) {
                    rej(err);
                }else{
                    res(doc);
                }
            });
        })
    });

};