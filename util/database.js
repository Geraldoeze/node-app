const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient

let _db;

const mongoConnect = (callback) => {
// MongoClient.connect("mongodb+srv://gerald:GZ3r0pV0toPBWmCV@node-cluster.uktzq.mongodb.net/node-application?retryWrites=true&w=majority");

MongoClient.connect("mongodb+srv://gerald:GZ3r0pV0toPBWmCV@node-cluster.uktzq.mongodb.net/shop?retryWrites=true&w=majority", 
{ useNewUrlParser: true,
  useUnifiedTopology: true })
    .then(client => {
        console.log('Connected');
        _db = client.db()
        callback(client)
    })
    .catch( err => {
        console.log(err)
    }); 

};


const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "NO database found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb; 