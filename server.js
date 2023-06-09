var mysql = require('mysql');
var express = require('express');
var fs = require("fs");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const multer = require('multer');

var app = express();
// Angi målplassering og filnavn for opplastede bilder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


// Opprett multer-opplastingsobjektet
const upload = multer({ storage: storage });



app.use(express.static('public'));

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24; // calculate one day

// express app should use sessions
app.use(sessions({
  secret: "thisismysecrctekeyfhgjkgfhkgfjlklkl",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));

// set the view engine to ejs
app.set('view engine', 'ejs');

// a variable to save a session
var session;

// Create database connection
var con = mysql.createConnection({
  host: "kristoffer-mysql.mysql.database.azure.com",
  user: "kristoffer",
  password: "Passord1",
  database: "helpdesk_db",
  port: 3306,
  ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") }
});

con.connect((error) => {
  if (error) {
    console.error('Feil ved tilkobling til MySQL-databasen: ' + error.stack);
    return;
  }

  console.log('Tilkoblet til MySQL-databasen som ID: ' + con.threadId);
});

app.get('/index.html', function (req, res) {
    //if (err) throw err;
  con.query("SELECT * FROM brukere", function (err, result, fields) {
    if (err) {
      console.error('Feil ved databaseforespørsel: ' + err.stack);
      res.status(500).send('Feil ved databaseforespørsel');
      return;
    }
    console.log(result);
    res.render('index.ejs', {
      data: result,
      var1: "tekst"

    }); // select
  }); // connect
}); // app get

app.get('/', function (req, res) {
  session = req.session;
  if (session.userid) {
    res.redirect('/user')// render

  } else {
    res.render('startup.ejs', {});
  }
}); // render

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('startup.ejs', {});
});

app.get('/user', function (req, res) {
  session = req.session;
  if (session.userid) {
    res.render('user.ejs', {
      userid: session.userid,
      data: session.all_user_info
    });
  } else {
    res.render('startup.ejs', {});
  }
});

app.post('/user', function (req, res) {
  // hent brukernavn og passord fra skjema på login
  var username = req.body.username;
  var password = req.body.password;
  console.log(username, password);

  // perform the MySQL query to check if the user exists
  var sql = 'SELECT * FROM brukere WHERE brukernavn = ? AND passord = ?';

  con.query(sql, [username, password], (error, results) => {
    if (error) {
      console.error('Feil ved databaseforespørsel: ' + error.stack);
        res.status(500).send('Feil ved databaseforespørsel');
      return;

    } else if (results.length === 1) {
        session = req.session;
        session.userid = req.body.username; // sett session userid til brukernavn
        session.mellomnavn = results[0].mellomnavn;
        session.all_user_info = results;
        session.person_nr = results[0].person_nr
        console.log("personnr:", results[0].person_nr)

        res.redirect('/user');
      } else {
        res.redirect('/login?error=invalid'); // redirect med error beskjed i GET
      }
    });
  });
  
  app.get('/login', function (req, res) {
    res.render('user.ejs', {});
  });

// POST-rute for å sende inn en sak
app.post('/user_insert', (req, res) => {
  // hent data fra skjemaet
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var lastname = req.body.lastname;
  var age = req.body.age;

  var sql = `INSERT INTO brukere (brukernavn, email, passord, etternavn, alder) VALUES (?, ?, ?, ?, ?)`;
  var values = [username, email, password, lastname, age];

  con.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('User inserted into database');
    
    res.render('startup.ejs');
  });
});

// logout button in user.ejs
app.get('/log_out', function (req, res) {
  //.destroy use to kill all session from user
  req.session.destroy(function (error) {
    if (error) {
      console.log(error);
    }
    res.render('startup.ejs');
  });
});

// Change account button in user.ejs
app.get('/change_account', function (req, res) {
  req.session.destroy(function (error) {
    if (error) {
      console.log(error);
    }
    res.render('startup.ejs');
  });
});

// Change Contact Agent button in user.ejs
app.get('/contact_agent', function (req, res) {
  if (!req.session.userid) {
    res.send("Not logged in")
} else {
  req.session.data = session.all_user_info;
res.render('send_case.ejs', {
  data: req.session ? req.session.data : session.all_user_info
});
}
});

// Change About Us button in user.ejs
app.get('/about_us', function (req, res) { 
  if (!req.session.userid) {
    res.send("Not logged in")
} else {
  req.session.data = session.all_user_info;
res.render('helpdesk_info.ejs', {
  data: req.session ? req.session.data : session.all_user_info
});
}
});

// Change FAQ button in user.ejs
app.get('/FAQ_site', function (req, res) {
  if (!req.session.userid) {
    res.send("Not logged in")
} else {
  req.session.data = session.all_user_info;
res.render('FAQ.ejs', {
  data: req.session ? req.session.data : session.all_user_info
});
}
});

app.get('/home_site', function (req, res) {
  if (!req.session.userid) {
    res.send("Not logged in")
} else {
  req.session.data = session.all_user_info;
res.render('user.ejs', {
  data: req.session ? req.session.data : session.all_user_info
});
}
});

app.get('/case_status', function (req, res) {
  if (!req.session.userid) {
    res.send("Not logged in");
  } else {
    var person_nr = req.session.person_nr;
    console.log("personnr:", person_nr);
    var sql = 'SELECT * FROM tickets WHERE eier_tickets = ?';
    con.query(sql, [person_nr], (error, result) => {
      if (error) {
        console.error('Feil ved dataforespørsel: ' + error.stack);
        res.status(500).send('Feil ved dataforespøsel');
      } else {
        res.render("case_status.ejs", {
          data: result
        });
      }
    });
  }
});


app.get('/cancel_case', function (req, res) {
  if (!req.session.userid) {
    res.send("Not logged in")
} else {
  req.session.data = session.all_user_info;
res.render('user.ejs', {
  data: req.session ? req.session.data : session.all_user_info
});
}
});

app.get('/user_info', function (req, res) {
  if (!req.session.userid) {
    res.send("Not logged in")
} else {
  req.session.data = session.all_user_info;
  res.render('user_info.ejs', {
    data: req.session ? req.session.data : session.all_user_info
});
}
});

// POST-rute for å sende inn en sak
app.post('/send_case', (req, res) => {
  // Hent data fra skjemaet
  console.log(req.body)
  var problem = req.body.problem;
  var image = req.body.image;
  var nivaa = req.body.nivaa;
  var timeframe = req.body.timeframe;
  var category = req.body.category;
  var case_started = req.body.case_started
  var case_closed = req.body.case_closed
  var status = req.body.status

  session = req.session;
  person_nr = session.person_nr;
  console.log(person_nr);



  var sql = `INSERT INTO tickets (problem, bilde, status, start_tid, tid_slutt, nivaa, tidsramme, kategori, eier_tickets) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  var values = [problem, image, status, case_started, case_closed, nivaa, timeframe, category, person_nr];
 
  con.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('case inserted into database');
    console.log(status, case_closed, case_started)

    res.redirect('/case_status');
  });
});


// GET-rute for å vise brukerinformasjon basert på brukerens ID
app.post('/user_info', upload.single('image'), (req, res) => {
  const { image, name, lastname, email, tlf, age } = req.body;
  const data = { image, name, lastname, email, tlf, age };

  // Utfør MySQL-spørring for å oppdatere brukerinformasjon i databasen
  const sql = 'UPDATE brukere SET bilde = ?, brukernavn = ?, etternavn = ?, email = ?, tlf = ?, alder = ? WHERE id = ?';
  const values = [image, name, lastname, email, tlf, age, req.session.userid]; 

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error('Feil ved databaseforespørsel: ' + err.stack);
      res.status(500).send('Feil ved databaseforespørsel');
      return;
    }

    console.log('Brukerinformasjon oppdatert i databasen');
    res.redirect('/user_info');
  });
});


// GET-rute for å vise tom skjema for brukerinformasjon
app.get('/user_info', (req, res) => {
  res.render('user_info.ejs');
});

  var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("Example app listening at http://%s:%s", host, port);
  });
