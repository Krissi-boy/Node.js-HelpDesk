var mysql = require('mysql');
var express = require('express');
var fs = require("fs");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

var app = express();
 

var conn=mysql.createConnection({host:"kristoffer-mysql.mysql.database.azure.com", 
user:"kristoffer", password:"Passord1", 
database:"helpdesk_db", port:3306, 
ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});


app.use(express.static('public'));
 
// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24; // calculate one day

// express app should use sessions
app.use(sessions({
   secret: "thisismysecrctekeyfhgjkgfhkgfjlklkl",
   saveUninitialized:true,
   cookie: { maxAge: oneDay },
   resave: false 
}));


// set the view engine to ejs
app.set('view engine', 'ejs');

 

// a variable to save a session
var session;


app.get('/index.html', function (req, res) {

    conn.connect(function(err) {
        //if (err) throw err;
        conn.query("SELECT * FROM brukere", function (err, result, fields) {
           if (err) throw err;
           console.log(result);     
                         
           res.render('index.ejs', {
              data: result,
              var1: "tekst"
                 
         }); // render
        }); // select
   });// connect
 }) // app get
 


 app.get('/', function (req, res) {
   session=req.session;
   if(session.userid){
      res.render('bruker.ejs', { 
          userid: session.userid      
      });

   } 
   else {
      res.render('startup.ejs', { });
   }
})

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('startup.ejs', {     
  });

})





app.get('/bruker', function (req, res) {
   session=req.session;
   if(session.userid){
      res.render('bruker.ejs', { 
          userid: session.userid      
      });

   } 
   else {
      res.render('index.ejs', { });
   }
})



app.post('/login', function (req, res) {
 
   // hent brukernavn og passord fra skjema på login
   var brukernavn = req.body.brukernavn;
   var passord = req.body.passord;

   // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM brukere WHERE brukernavn = ? AND passord = ?';
   
   con.query(sql, [brukernavn, passord], (error, results) => {
       if (error) {
           res.status(500).send('Internal Server Error');
       } else if (results.length === 1) {
           res.redirect('/profile');
           session.userid=req.body.username; // set session userid til brukernavn

       } else {
           res.redirect('/login?error=invalid'); // redirect med error beskjed i GET
       }
   });
});



app.post('/signup', (req, res) => {
 
   var con = mysql.createConnection({host:"mysql.database.azure.com", user:"azureuser", 

   password:"Passord", database:"db", port:3306, ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});

   
   var brukernavn = req.body.brukernavn;
   var email = req.body.email;
   var passord = req.body.passord;

   var sql = `INSERT INTO brukere (brukernavn, email, passord) VALUES (?, ?, ?)`;
   var values = [brukernavn, email, passord];

   con.query(sql, values, (err, result) => {
       if (err) {
           throw err;
       }
       console.log('User inserted into database');
       
       res.render('index.ejs');

   });

});




 var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })