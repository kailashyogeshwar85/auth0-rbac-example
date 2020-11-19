const express      = require("express");
const cors         = require("cors");
const morgan       = require("morgan");
const helmet       = require("helmet");
const jwt          = require("express-jwt");
const jwksRsa      = require("jwks-rsa");
const bodyParser   = require('body-parser');
const checkScopes  = require('express-jwt-authz');
const authConfig   = require("./src/auth_config.json");
const EventService = require('./api/services/event.service');
const MongoClient = require('mongodb').MongoClient;

const dbURL  = 'mongodb://localhost:27017'
const dbName = 'event';


const app = express();

const port = process.env.API_PORT || 3002;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (!authConfig.domain || !authConfig.audience) {
  throw new Error(
    "Please make sure that auth_config.json is in place and populated"
  );
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

app.get("/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!"
  });
});

app.get('/api/events', checkJwt, checkScopes(['event:view']), EventService.getEvents);
app.post('/api/event', checkJwt, checkScopes(['event:create']), EventService.createEvent);
app.post('/api/event/:id', checkJwt, checkScopes(['event:register']), EventService.registerEvent);
app.get('/api/event/:id', checkJwt, checkScopes(['event:view']), EventService.getEventById);
app.put('/api/event/:id', checkJwt, checkScopes(['event:update']), EventService.updateEvent);
app.delete('/api/event/:id', checkJwt, checkScopes(['event:delete']), EventService.deleteEvent);
app.get('/api/events/registrations', checkJwt, checkScopes(['event:view']), EventService.getRegistrationsForUser);
app.post('/api/account/deactivate', checkJwt, checkScopes(['account:deactivate']), EventService.deactivate);

MongoClient.connect(dbURL, (err, client) => {
  if (err) throw err;
  console.log('connected to server');

  global.db = client.db(dbName);
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
