const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://henrikskog:henrikskog@start-zaxvf.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true , useUnifiedTopology: true})
let db


client.connect(err => {
    db = client.db("paaskespilldb");
    module.exports = db
  });

