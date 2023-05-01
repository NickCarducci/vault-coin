const Mux = require("@mux/mux-node");
const { Video } = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET
);

const port = 8080,
  allowedOrigins = [
    "https://sausage.saltbank.org",
    "https://i7l8qe.csb.app",
    "https://vau.money",
    "https://jwi5k.csb.app"
  ],
  express = require("express"),
  app = express(),
  cors = require("cors"),
  preflight = (req, res) => {
    const origin = req.headers.origin;
    app.use(cors({ origin })); //https://stackoverflow.com/questions/36554375/getting-the-req-origin-in-express
    if (allowedOrigins.indexOf(req.headers.origin) === -1)
      return res.send({
        statusCode: 401,
        error: "no access for this origin- " + req.headers.origin
      });
    allowOriginType(req.headers.origin, res);
    //"Cannot setHeader headers after they are sent to the client"

    res.statusCode = 204;
    res.send(); //res.sendStatus(200);
  },
  //const printObject = (o) => Object.keys(o).map((x) => {return {[x]: !o[x] ? {} : o[x].constructor === Object ? printObject(o[x]) : o[x] };});
  standardCatch = (res, e, extra, name) => {
    res.send({
      statusCode: 402,
      statusText: "no caught",
      name,
      error: e,
      extra
    });
  },
  allowOriginType = (origin, res) => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    //allowedOrigins[allowedOrigins.indexOf(origin)]
    res.setHeader("Content-Type", "Application/JSON");
    res.setHeader("Allow", ["POST", "OPTIONS", "GET"]);
    res.setHeader("Access-Control-Allow-Headers", [
      "Content-Type",
      "Access-Control-Request-Method",
      "Access-Control-Request-Methods",
      "Access-Control-Request-Headers"
    ]);
    res.setHeader("Access-Control-Allow-Methods", ["POST", "OPTIONS", "GET"]);
    //https://stackoverflow.com/questions/12027187/difference-between-allow-and-access-control-allow-methods-in-http-response-h
  },
  clean = express.Router(),
  scope = express.Router();

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
//https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
//http://johnzhang.io/options-req-in-express
//var origin = req.get('origin');

const nonbody = express
  .Router()
  .get("/", (req, res) => res.status(200).send("shove it"))
  .options("/*", preflight);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var statusCode = 200,
  statusText = "ok";

scope
  .post("/seek", async (req, res) => {
    allowOriginType(req.headers.origin, res);
    //https://www.npmjs.com/package/@mux/mux-node
    const stream = await Video.LiveStreams.get(req.body.streamId); //liveStreamId
    //https://muxinc.github.io/mux-node-sdk/file/src/video/resources/liveStreams.js.html

    res.send({
      statusCode,
      statusText,
      stream
    });
  })
  .post("/hide", async (req, res) => {
    allowOriginType(req.headers.origin, res);

    const stream = await Video.LiveStreams.disable(req.body.streamId, {
      policy: "public"
    });
    res.send({
      statusCode,
      statusText,
      stream
    });
  })
  .post("/enable", async (req, res) => {
    allowOriginType(req.headers.origin, res);

    const stream = await Video.LiveStreams.enable(req.body.streamId, {
      policy: "public"
    });
    res.send({
      statusCode,
      statusText,
      stream
    });
  })
  .post("/tell", async (req, res) => {
    allowOriginType(req.headers.origin, res);
    //PACKAGE DOCS https://muxinc.github.io/mux-node-sdk/
    const stream = await Video.LiveStreams.create({
      playback_policy: "public",
      new_asset_settings: { playback_policy: "public" }
    }); //https://www.npmjs.com/package/@mux/mux-node
    //https://docs.mux.com/api-reference#video/operation/create-live-stream
    const streamId = await Video.LiveStreams.createPlaybackId(
      stream.data.stream_key,
      {
        policy: "public"
      }
    );
    res.send({
      statusCode,
      statusText,
      streamId: streamId
    }); //https://docs.mux.com/
  }) //https://docs.mux.com/api-reference
  .post("/end", async (req, res) => {
    allowOriginType(req.headers.origin, res);
    var stream = await Video.LiveStreams.signalComplete(req.body.streamId);
    //const stream_key = await Video.LiveStreams.resetStreamKey(req.body.streamId);
    //createPlaybackId: streamid cleanup?
    stream = await Video.LiveStreams.deletePlaybackId(req.body.streamId, {
      policy: "public"
    });
    //const stream_key = await Video.LiveStreams.del(req.body.streamId);
    res.send({
      statusCode,
      statusText,
      streamId: req.body.streamId
    });
  })
  .post("/load", async (req, res) => {
    allowOriginType(req.headers.origin, res);
    const video = await Video.LiveStreams.create({
      playback_policy: "public",
      new_asset_settings: { playback_policy: "public" }
    });
    const videoId = await Video.Assets.createPlaybackId(video.id, {
      policy: "public"
    });
    res.send({
      statusCode,
      statusText,
      videoId
    });
  });

clean.post("/clean", async (req, res) => {
  allowOriginType(req.headers.origin, res);

  const stream = await Video.LiveStreams.deletePlaybackId(req.body.streamId, {
    policy: "public"
  });
  res.send({
    statusCode,
    statusText,
    stream
  }); //https://docs.mux.com/
}); //https://docs.mux.com/api-reference
var timeouts = {},
  timeoutnames = [];
//https://stackoverflow.com/questions/31928417/chaining-multiple-pieces-of-middleware-for-specific-route-in-expressjs
app.use(nonbody, scope, clean); //methods on express.Router() or use a scoped instance
app.listen(port, () => console.log(`localhost:${port}`));
process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, exitCode) {
  if (options.cleanup) {
    timeoutnames.forEach((x) => clearTimeout(timeouts[x]));
    console.log("clean");
  }
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when actions is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));
//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
