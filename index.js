require("dotenv").config();
const fetch = require("node-fetch");
const express = require("express");

const app = express();
const port = 8080;
//http://johnzhang.io/options-request-in-express
//var origin = req.get('origin');
var allowedOrigins = [
  "https://sausage.saltbank.org",
  "https://i7l8qe.csb.app",
  "https://vau.money",
  "https://jwi5k.csb.app"
];

app
  .get("/", (req, res) => res.status(200).send("shove it"))
  .get("/logs", (req, res) => {
    fetch(`https://api.digitalocean.com/v2/apps/${
      app_id
      }/deployments/${
      deployment_id
      }/components/${
      component_name
      }/logs`)
      //https://docs.digitalocean.com/reference/api/api-reference/#operation/apps_get_logs
      .then(async res => await res.json())
      .then(result => {
        res.redirect(301, `${result.live_url}`);
        res.end();
      })
      .catch(er => {
        res.status(405).send(er);
      })
  })
  .options("/", (req, res) => {
    var origin = req.headers.origin; //https://stackoverflow.com/questions/36554375/getting-the-request-origin-in-express
    if (allowedOrigins.indexOf(origin) === -1)
      return res
        .status(401)
        .send(`{error:${"no access for this origin- " + origin}}`);
    //res.header("":_)
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
    res.set(
      "Access-Control-Allow-Origin",
      allowedOrigins[allowedOrigins.indexOf(origin)]
    );
    res.set(
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin, Access-Control-Allow-Methods, Origin, Content-Type, Referer, Accept"
    );
    res.set("Content-Type", "Application/JSON"); //res.send(200,"ok")
    res.status(204).send({ data: "ok" }); //res.sendStatus(204);
  })
  .post("/", (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";
    res.status(status).send({ statusText, data });
  })
  .listen(port, () => console.log(`localhost:${port}`));
