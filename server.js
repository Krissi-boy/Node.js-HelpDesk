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

 
//username and password   
const brukernavn = 'Kristoffer';
const passord = 'Passord1';
 

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
      res.render('login_index.ejs', { 
          userid: session.userid      
      });

   } 
   else {
      res.render('login.ejs', { });
   }
})

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('login.ejs', {     
  });

})

app.post('/user',(req,res) => {

console.log(req.body.brukernavn)
console.log(req.body.passord)

  if(req.body.brukernavn == brukernavn && req.body.passord == passord){
      session=req.session;
      session.userid=req.body.brukernavn;
      console.log(req.session)
      res.send(`Hei, velkommen! <a href=\'/logout'>Trykk her for å logge ut</a>`);
  }
  else{
      res.send('Feil brukernavn eller passord');
  }
})


 var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })