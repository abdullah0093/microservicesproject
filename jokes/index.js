const express = require('express');
const app = express();

//Logging system with WISTON LIBRARY
var winston = require('winston'), expressWinston = require('express-winston');
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
  });

  //Jaeger for tracing System
  var initJaegerTracer = require("jaeger-client").initTracer;
    function initTracer(serviceName) {
    var config = {
    serviceName: serviceName,
    sampler: {
        type: "const",
        param: 1,
    },
    reporter: {
        logSpans: true,
        agentHost: 'localhost'
    },
    };
    var options = {
    logger: {
        info: function logInfo(msg) {
        console.log("Information", msg);
        },
        error: function logError(msg) {
        console.log("ERR", msg);
        },
    },
    };
    return initJaegerTracer(config, options);
}
const opentracing = require("opentracing");
const tracer = initTracer("JOKES");

app.get(('/'),(req, res)=>{
  const span = tracer.startSpan("REQUEST JOKESJOKES");
     res.send("JOKES");
     span.finish();
  })


//Code to make unirest request to get JOKES
var unirest = require("unirest");


  app.get(('/jokes'),(req, res)=>{
    const span = tracer.startSpan("REQUEST TO GET JOKES");
    var req = unirest("GET", "https://jokeapi.p.rapidapi.com/category/Programming");
    req.query({
        "format": "json"
    });
    req.headers({
        "x-rapidapi-host": "jokeapi.p.rapidapi.com",
        "x-rapidapi-key": "fb37b763a7mshc50162ebfa2d00bp1d47b1jsn0990b8b2664c"
    });
    req.end(function (response) {
        if (response.error) throw new Error(response.error);
    
        res.send(response.body.joke);
        span.finish();
    });
    })
  
  app.listen(8080, () =>{
      console.log("Running on port 8080");
  })