/**
 * Created by Tesfay on 4/25/2017.
 */

module.exports = function(db, headers) {
    const token = headers['token'];
    const email = headers['email'];
    db.collection('users').findOne({'token': token,'email': email },function(err, doc){
        if(err) {
            console.log('Error fetching data from mongodb');
        }
        console.log(doc);
        return doc;
    });
};