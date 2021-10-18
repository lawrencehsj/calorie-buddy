//index.js file
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const port = 8089;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const db = mysql.createConnection ({
    host: "localhost",
    user: "root",
    password: "root",
    database: "calorieBuddy"
});
//connect to db
db.connect((err) => {
    if(err)
        throw err;
    console.log("Connected to database");
});

global.db = db;

require("./routes/main")(app);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log('Example app listening on port ${port}!'));

//original::index.js
// var http = require("http");

// http
//   .createServer(function(req, res) {
//     res.writeHead(200, { "Content-Type": "text/plain" });
//     res.write("Welcome to the mid-term application! \n\n");
//     res.write("This application must run on PORT 8089");
//     res.end();
//   })
//   .listen(8089, function() {
//     console.log("Node server is running...");
//   });
