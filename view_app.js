var app = require('express')();
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://chaz:beauchamp@maincluster.coxwznq.mongodb.net/?retryWrites=true&w=majority&appName=mainCluster";

app.use(bodyParser.urlencoded({ extended: true }));

const database = "Zips";
const collection = "places";

app.get('/', function(req, res) {
    res.send(`
    <form action="/process" method="post">
        <input type="text" name="input" placeholder="Enter place or ZIP code">
        <input type="submit" value="Search">
    </form>
    `);
});

app.post('/process', function(req, res) {
    const input = req.body.input;
    const isZipCode = !isNaN(parseInt(input));

    MongoClient.connect(url, function(err, client) {
        if(err) { 
        console.log("Connection err: " + err);
        return res.send("An error occurred while connecting to the database.");
        }

    const databaseInMongo = client.db(database);
    const collectionInMongo = databaseInMongo.collection(collection);

    let query;
    if (isZipCode) {
      query = { zips: input };
    } else {
      query = { place: input };
    }

    collectionInMongo.findOne(query, function(err, result) {
        if (err) {
          client.close();
          return res.send("An error occurred while searching the database.");
        }
  
    if (result) {
        let response = `<h1>Search Results</h1>`;
        response += `<p>Place: ${result.place}</p>`;
        response += `<p>Zip Codes: ${result.zips.join(', ')}</p>`;
        res.send(response);
        } else {
        res.send("There is no data for that query");
        }
        
        client.close();
    });

    });
});

// const PORT = 8080; // local
const PORT = process.env.PORT || 3000; // this allows you to run online through Heroku

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));