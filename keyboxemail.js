const port = 8080,
  allowedOrigins = [
    "https://sausage.saltbank.org",
    "https://i7l8qe.csb.app",
    "https://vau.money",
    "https://jwi5k.csb.app"
  ],
  fs = require("fs"),
  Mbox = require("node-mbox"),
  Mailer = require("nodemailer"),
  //MaildirScan = require("maildir-scan"),
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
  email = express.Router();

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

email.post("/read", (req, res) => {
  allowOriginType(req.headers.origin, res);
  //https://github.com/clee/node-maildir/blob/main/lib/maildir.mjs
  const mailDir = __dirname + `/home/host/${req.body.localpart}/Maildir`;
  fs.readdir(mailDir, async (err, mailtruck) => {
    if (err) return standardCatch(res, err, { mailDir }, "mailtruck"); //res.send multiple times, will end gracefully
    await Promise.all(
      mailtruck
        .forEach(async (x) => {
          const mbox = new Mbox(x, {
            encoding: "utf-8"
          }); //https://www.npmjs.com/package/node-mbox
          const done = JSON.stringify(mbox);
          return await new Promise((r) => r(done));
        })
        .then((ml) => {
          const mail = ml.map((x) => {
            const done = JSON.parse(x);
            //move from tmp to new to cur
            return done;
          });
          res.send({
            statusCode,
            statusText,
            mail
          });
        })
    );
  }).post("/send", (req, res) => {
    allowOriginType(req.headers.origin, res);

    let transporter = Mailer.createTransport(
      //https://stackoverflow.com/questions/32264946/sending-email-from-local-host-with-nodemailer
      {
        host: "localhost", //req.headers.host,
        port: 25, // 465,
        secure: true,
        //sendmail: true,
        //newline: "unix",
        //path: "/usr/sbin/sendmail",
        tls: {
          rejectUnauthorized: false
        }
      }
    );
    const newMail = {
      from: req.body.email,
      to: req.body.recipients,
      subject: req.body.subject,
      text: req.body.message,
      html: `<p>${req.body.message}</p>`
    };
    transporter.sendMail(newMail, (err, info) => {
      if (err) return standardCatch(res, err, { mailDir }, "sendMail");
      console.log(info.envelope);
      console.log(info.messageId);
    });
    res.send({
      statusCode,
      statusText,
      newMail
    });
  });
});
var timeouts = {},
  timeoutnames = [];
//https://stackoverflow.com/questions/31928417/chaining-multiple-pieces-of-middleware-for-specific-route-in-expressjs
app.use(nonbody, email); //methods on express.Router() or use a scoped instance
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
