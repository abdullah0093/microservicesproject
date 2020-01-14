const express = require('express');
const app = express();
const path = require('path');

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
const tracer = initTracer("VISUAL");

app.get(('/'),(req, res)=>{
  const span = tracer.startSpan("REQUEST TO GET VISUAL");
     res.sendFile(path.resolve(__dirname, ".", "documents", "visual.html"));
     span.finish();
  })
  
  app.listen(8080, () =>{
      console.log("Running on port 8080");
  })
