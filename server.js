var mysql = require('mysql');
var express = require('express');
var fs = require("fs");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

var app = express();
 


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
      res.render('user.ejs', { 
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





app.get('/user', function (req, res) {
   session=req.session;
   if(session.userid){


      
      res.render('user.ejs', { 
          userid: session.userid,      
         data: session.all_user_info


      });

   } 
   else {
      res.render('startup.ejs', { });
   }
})



app.post('/user', function (req, res) {

var con = mysql.createConnection({host:"kristoffer-mysql.mysql.database.azure.com", 
user:"kristoffer", password:"Passord1", 
database:"helpdesk_db", port:3306, 
ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});

 
   // hent brukernavn og passord fra skjema på login
   var username = req.body.username;
   var password = req.body.password;
   console.log(username, password)

   // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM brukere WHERE brukernavn = ? AND passord = ?';
   
   con.query(sql, [username, password], (error, results) => {
       if (error) {
         throw error;
           res.status(500).send('Internal Server Error');
       } else if (results.length === 1) {
         session=req.session
          session.userid=req.body.username; // set session userid til brukernavn
          session.mellomnavn = results[0].mellomnavn
         session.all_user_info = results
          
          
          
          res.redirect('/user');

       } else {
           res.redirect('/login?error=invalid'); // redirect med error beskjed i GET
       }
   });
});



app.post('/user_insert', (req, res) => {
 
   var con=mysql.createConnection({host:"kristoffer-mysql.mysql.database.azure.com", 
   user:"kristoffer", password:"Passord1", 
   database:"helpdesk_db", port:3306, 
   ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});
   

   
   var username = req.body.username;
   var email = req.body.email;
   var password = req.body.password;

   var sql = `INSERT INTO brukere (brukernavn, email, passord) VALUES (?, ?, ?)`;
   var values = [username, email, password];

   con.query(sql, values, (err, result) => {
       if (err) {
           throw err;
       }
       console.log('User inserted into database');
       
       res.render('index.ejs');

   });
})


app.get('/', function (req, res) {
      session=req.session;
      if(session.userid){
         res.render('user_insert.ejs', { 
             userid: session.userid      
         });
   
      } 
      else {
         res.render('startup.ejs', { });
      }
   })
   









 var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })


