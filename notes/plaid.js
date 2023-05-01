require("dotenv").config();
const fetch = require("node-fetch");
const express = require("express");
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
const plaid = require("plaid");
const plaidClient = new plaid.Client(
  process.env.PLAID_CLIENT_ID,
  process.env.PLAID_SECRET,
  process.env.PUBLIC_KEY,
  plaid.environments.sandbox,
  {version: '2018-05-22'}
);

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

var results = {},
  status = 200,
  statusText = "ok";
app
  .get("/", (req, res) => res.status(200).send("shove it"))
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
    res.status(status).send({ statusText, data: {} });
  })
  .post("/join", async (request, res) => {
    var {
      account,
      origin,
      company,
      business_profile,
      settings,
      business_type
    } = request.query;
    if (!account) {
      account = await stripe.accounts.create({
        type: "standard",
        company,
        business_profile,
        settings,
        business_type
      });
      origin = request.headers.origin;
    }
    const accountLink = await stripe.accountLinks.create({
      account, //: 'acct_1032D82eZvKYlo2C',
      return_url: origin,
      refresh_url: `https://vault-co.in/join?account=${account}&origin=${origin}`,
      type: "account_onboarding"
    });
    res.redirect(accountLink.url);
  })
  .post("/secure", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const {
      access_token,
      plaid_processor_token,
      first,
      last,
      address,
      phone,
      iban,
      accounting_number,
      routing_number,
      bank_address,
      bank_account_type
    } = req.body;

            if (!plaid_processor_token)return res.status(status).send({ statusText, data: {} });
    const person = await stripe.accounts.createPerson(plaid_processor_token, {
      first_name: first,
      last_name: last,
      address,
      relationship: { owner: true }
    });

    const account = await stripe.accounts.update(plaid_processor_token, {
      company: {
        owners_provided: true,
        ownership_declaration: {
          date: "",
          ip: "",
          user_agent: ""
        }
      }
    });
              await plaidClient.invalidateAccessToken({ access_token });
        res.status(status).send({ statusText, data: {plaid_processor_token} });

    /*const customer = await stripe.customers.create({
      name: first + " " + last,
      description: "",
      phone,
      address,
      shipping: {
        phone,
        name: first + " " + last,
        address
      }
    });
    stripe.sources.create(
      {
        type: "ach_debit", //'ach_credit_transfer',
        currency: "usd",
        owner: {
          address,
          name: first + " " + last,
          phone
        }
      },
      async (err, source) => {
        const bank = await stripe.customers
          .createSource(customer.id, {
            source: source.id //"btok_1MVMDdGVa6IKUDzpsGe08O4W"
          })
          .then(async (res) => await res.json())
          .then(async (d) => {
            if (plaid_processor_token)
              await plaidClient.invalidateAccessToken({ access_token });
            return d.data; //itemAccessTokenInvalidate
          });

        res.status(status).send({ statusText, data: bank });
      }
    );*/
  })
  .post("/deleteaccess", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";
    const { access_token } = req.body;
    const resp = await plaidClient.invalidateAccessToken({ access_token });

    res.status(status).send({ statusText, data: resp });
  })
  .post("/balances", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const balances = await fetch(`https://api-sandbox.circle.com/v1/wallets`, {
      "Content-Type": "Application/JSON",
      Accept: "Application/JSON"
    })
      .then(async (res) => await res.json())
      .then((d) => d.data);

    res.status(status).send({ statusText, data: balances });
  })
  .post("/balance", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { wallet_id } = request.body;
    //
    if (wallet_id)
      return res.status(status).send({
        statusText,
        data: await fetch(
          `https://api-sandbox.circle.com/v1/wallets/${wallet_id}`,
          {
            "Content-Type": "Application/JSON",
            Accept: "Application/JSON"
          }
        )
          .then(async (res) => await res.json())
          .then(async (d) => {
            results.bank = d.data;
            //d.data.{walletId, entityId, type, description, balances.{amount, currency}}
            await fetch(
              `https://api-sandbox.circle.com/v1/wallets/${walletId}/addresses`,
              {
                //"Content-Type": "Application/JSON",
                Accept: "Application/JSON"
              }
            )
              .then(async (res) => await res.json())
              .then((d) => {
                results.instructions = d.data;
                return results;
              });
            //d.data.[address, addressTag, currency"USD", chain"algo"]}
            //X-Request-Id header UUID v4 supportId
          })
      });

    res.status(status).send({ statusText, data: results });
  }) //move
  .post("/establish", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { wallet_id } = req.body;

    if (wallet_id)
      return res.status(status).send({
        statusText,
        data: await fetch(
          `https://api-sandbox.circle.com/v1/wallets/${walletId}/addresses`,
          {
            "Content-Type": "Application/JSON",
            Accept: "Application/JSON",
            body: {
              idempotencyKey: "",
              currency: "USD",
              chain: "ALGO"
            }
          }
        )
          .then(async (res) => await res.json())
          .then((d) => d.data)
      });
    res.status(status).send({ statusText, data: results });
  })
  .post("/tabs", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const tabs = await fetch(`https://api-sandbox.circle.com/v1/cards`, {
      "Content-Type": "Application/JSON",
      Accept: "Application/JSON"
    })
      .then(async (res) => await res.json())
      .then((d) => d.data);

    res.status(status).send({ statusText, data: tabs });
  })
  .post("/tab", async (request, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = request.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { card_id } = request.body;
    //
    if (card_id)
      return res.status(status).send({
        statusText,
        data: await fetch(
          `https://api-sandbox.circle.com/v1/cards/${card_id}`,
          {
            "Content-Type": "Application/JSON",
            Accept: "Application/JSON"
          }
        )
          .then(async (res) => await res.json())
          .then((d) => d.data)
      });
    res.status(status).send({ statusText, data: results });
  })
  .post("/ring", async (request, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = request.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { iban, key_id } = request.body;

    const bank = await fetch(`https://api-sandbox.circle.com/v1/cards`, {
      "Content-Type": "Application/JSON",
      Accept: "Application/JSON",
      body: {
        idempotencyKey: "",
        keyId: key_id,
        encryptedData: "", //Number, CVV
        billingDetails: {
          name: "",
          city: "",
          country: "",
          line1: "",
          line2: "",
          district: "",
          postalCode: ""
        },
        expMonth: 1,
        expYear: 2025,
        metadata: {}
      }
    })
      .then(async (res) => await res.json())
      .then((d) => d.data);

    res.status(status).send({ statusText, data: bank });
  })
  .post("/transfer", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { wallet_id, bank_id } = req.body;

    const ach = bank_id.split("ach")[1];

    const banks = await fetch(
      `https://api-sandbox.circle.com/v1/businessAccount/transfers`,
      {
        "Content-Type": "Application/JSON",
        Accept: "Application/JSON",
        body: JSON.stringify({
          source: {
            type: "wallet",
            id: wallet_id
          },
          destination: {
            type: "wire",
            id: bank_id
          },
          amount: { amount: "", currency: "USD" }
        })
      }
    )
      .then(async (res) => await res.json())
      .then(async (d) => {
        return d.data;
      });

    res.status(status).send({ statusText, data: banks });
  })
  .post("/banks", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const banks = await fetch(
      `https://api-sandbox.circle.com/v1/businessAccount/banks/wires`,
      {
        "Content-Type": "Application/JSON",
        Accept: "Application/JSON"
      }
    )
      .then(async (res) => await res.json())
      .then(async (d) => {
        results.wires = d.data;
        //d.data.{walletId, entityId, type, description, balances.{amount, currency}}
        await fetch(
          `https://api-sandbox.circle.com/v1/businessAccount/banks/ach`,
          {
            "Content-Type": "Application/JSON",
            Accept: "Application/JSON"
          }
        )
          .then(async (res) => await res.json())
          .then((d) => {
            results.ach = d.data;
            return results;
          });
      });

    res.status(status).send({ statusText, data: banks });
  })
  .post("/bank", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { bank_id } = req.body;
    //
    if (bank_id) {
      const ach = bank_id.split("ach")[1];
      return res.status(status).send({
        statusText,
        data: await fetch(
          `https://api-sandbox.circle.com/v1/businessAccount/banks/${
            ach ? "ach" : "wires"
          }/${ach ? ach : bank_id}`,
          {
            "Content-Type": "Application/JSON",
            Accept: "Application/JSON"
          }
        )
          .then(async (res) => await res.json())
          .then(async (d) => {
            results.bank = d.data;
            //d.data.{walletId, entityId, type, description, balances.{amount, currency}}
            !ach &&
              /*!ach_id &&*/ (await fetch(
                `https://api-sandbox.circle.com/v1/businessAccount/banks/wires/${bank_id}/instructions`,
                {
                  "Content-Type": "Application/JSON",
                  Accept: "Application/JSON"
                }
              )
                .then(async (res) => await res.json())
                .then((d) => {
                  results.instructions = d.data;
                  return results;
                }));
          })
      });
    }
    res.status(status).send({ statusText, data: results });
  })
  .post("/developer/balance", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    res.status(status).send({
      statusText,
      data: await fetch("https://api-sandbox.circle.com/v1/balances", {
        "Content-Type": "Application/JSON",
        Accept: "Application/JSON"
      }).then(async (res) => await res.json())
      //data.{available.{amount,currency},unsettled.{amount,currency}}
      //X-Request-Id header UUID v4 supportId
    });
  })
  .listen(port, () => console.log(`localhost:${port}`));
