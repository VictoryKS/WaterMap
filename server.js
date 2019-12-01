'use strict';

const express = require('express');
const formidable = require('express-formidable');
const mysql = require('mysql');

let authorized = false;

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Afynfcvfujhbz",
  database: "watermap"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to db!");
});

const app = express();

app.use(express.static(__dirname + "/web"));

app.get('/', function (request, response) {
  authorized = false;
  response.sendFile(__dirname + "/static/index.html");
});

app.get('/map', function (request, response) {
  if (authorized)
    response.sendFile(__dirname + "/web/map.html");
  else
    response.redirect("/");
});

app.use(formidable());

app.post('/users', function (request, response, next) {
  console.log(request.fields);
  const user = request.fields;
  const login = user.login;
  const password = user.password;
    con.query("SELECT * FROM users WHERE login = '" + login + "' AND password = '" + password + "'", function(err, res) {
      if (err) throw err;
      if (res && res.length > 0) {
        authorized = true;
        response.redirect("/map");
      }
      else
        response.redirect("/");
    });
});

app.listen(3000);
