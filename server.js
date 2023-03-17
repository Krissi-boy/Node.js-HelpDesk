var mysql = require('mysql');
var express = require('express');
var fs = require("fs");
var app = express();
 

var conn=mysql.createConnection({host:"kristoffer-mysql.mysql.database.azure.com", 
user:"kristoffer", password:"Passord1", 
database:"test", port:3306, 
ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});


app.use(express.static('public'));
 


// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/index.html', function (req, res) {

    conn.connect(function(err) {
        //if (err) throw err;
        conn.query("SELECT * FROM test_1", function (err, result, fields) {
           if (err) throw err;
           console.log(result);     
                         
           res.render('index.ejs', {
              data: result,
              var1: "tekst"
                 
         }); // render
        }); // select
   });// connect
 }) // app get
 
 var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })