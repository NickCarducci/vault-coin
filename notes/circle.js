require("dotenv").config();
const fetch = require("node-fetch");
const express = require("express");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": "",
      "PLAID-SECRET": env.processor.plaidSecret,
      "Plaid-Version": "2020-09-14"
    }
  }
});

const plaidClient = new PlaidApi(configuration);

//i was going to use cash, but really you can cash advance.
//But at least I can use usdc instead of my own developer account.
//use case income or stock
//bond stolen contracts. compulsory cometition
//plaintiff payable tax
//video evidence gateway, industry variable public docket

//open source is why pharma banking is controlled
//take billings snd charge a big pot
//the doctors take billings. stripe, but for currency

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
const transactionsAndLogin = async (request, res) => {
  res.set("Content-Type", "Application/JSON");
  var { origin } = request.headers;
  res.set("Access-Control-Allow-Origin", origin);
  var status = 200,
    statusText = "defaultText";
  const { public_token } = request.body;
  //https://plaid.com/docs/link/web/#onsuccess
  const access_token = await plaidClient
    .itemPublicTokenExchange({ public_token })
    .then((d) => d.data);
  /*const accounts_response = await plaidClient.accountsGet({ access_token });
  const accounts = accounts_response.data.accounts;*/
  /*const accounts = await plaidClient
    .accountsGet({ access_token })
    .then((d) => d.data);
  const transactions = await plaidClient
    .transactionsSync({ access_token })
    .then((d) => d.data);
  const authData = await plaidClient
    .authGet({ access_token })
    .then((d) => d.data);
  const identity = await plaidClient
    .identityGet({ access_token })
    .then((d) => d.data); //accounts
  const balance = await plaidClient
    .accountsBalanceGet({ access_token })
    .then((d) => d.data);*/

  //const item = await plaidClient.itemGet({ access_token }).then((d) => d.data);

  /*const institution = await plaidClient
    .institutionsGetById({
      institution_id: item.institution_id,
      country_codes: ["us"]
    })
    .then((d) => d.data);*/
  res.status(status).send({
    statusText,
    data: access_token/*{
      accounts,
      transactions,
      authData,
      identity,
      balance,
      item,
      institution
    }*/
  });
};
var results = {},
  status = 200,
  statusText = "ok";
app
  .get("/", (req, res) => res.status(200).send("shove it"))
  .get("/logs", (req, res) => {
    fetch(
      `https://api.digitalocean.com/v2/apps/${app_id}/deployments/${deployment_id}/components/${component_name}/logs`
    )
      //https://docs.digitalocean.com/reference/api/api-reference/#operation/apps_get_logs
      .then(async (res) => await res.json())
      .then((result) => {
        res.redirect(301, `${result.live_url}`);
        res.end();
      })
      .catch((er) => {
        res.status(405).send(er);
      });
  })
  //freedom is from G-d makes it seem like he can take it away, or anyone can pray that
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

    /**
    https://plaid.com/docs/link/duplicate-items/
      fetch("https://vault-co.in/join", {
        "Content-Type": "Application/JSON",
        Accept: "Application/JSON"
      })
        .then(async (res) => await res.json())
        .then((result) => {
          addDoc(collection(firestore, "aggregations"), {
            authorId: this.props.auth.uid,
            plaidtoken: result.data.access_token
            //desist free content invokes usufructuary rights / responsibilities
          }); //.catch(standardCatch);
        })
        .catch(standardCatch);
     */
    const { authorId } = request.body;

    const configs = {
      user: { client_user_id: authorId },
      client_name: `VaultCoin`,
      language: "en",
      products: ["ath"], //Products.Transactions.split(","),
      webhook: "", //callback
      redirect_uri: request.headers.origin,
      //android_package_name:,
      country_codes: ["US"]
    };

    res.status(status).send({
      statusText,
      data: {
        access_token: await plaidClient
          .linkTokenCreate(configs)
          .then((d) => d.data)
      }
    });
  })
  //is using a cash management account worth the anticompetitive inflation

  //holding back is a verb not developmentally disabled
  //innocence precedence
  //not mere censorship, subjugation: admit guilt subjugation
  //plaintiff payable tax; free content is abused in tos network effect
  //shuldn't subjugation use more than plea
  //booger creep warranty overhead labor
  //what hapened to a balanced market. get a permit. free content is abused in tos
  //warden wants something threat, you still living right, so what abot inflation and packages
  //not deals but force intractable
  .post("/welcome", transactionsAndLogin) //coatcheck/hello
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
  /*.post("/payout", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { wallet_id, bank_id } = req.body;

    const ach = bank_id.split("ach")[1];

    const banks = await fetch(
      `https://api-sandbox.circle.com/v1/payouts`,
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
        return d.data
      })

    res.status(status).send({ statusText, data: banks });

  })*/
  //payment ach, card (payments)
  //payout wire, sen, signet (core, businessAccount/payouts)
  //payout wire, ach sepa (payouts)
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
        return d.data
      })

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
          `https://api-sandbox.circle.com/v1/businessAccount/banks/${ach ? "ach" : "wires"}/${
          ach ? ach : bank_id
          }`,
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
  .post("/secure", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { access_token,
      plaid_processor_token,
      billing_details,
      iban,
      accounting_number,
      routing_number,
      bank_address,
      bank_account_type
    } = req.body;

    var addBank = {
      idempotencyKey: "",
      billingDetails: billing_details/*{
        name: "",
        city: "",
        country: "",
        line1: "",
        line2: "",
        district: "",
        postalCode: ""
      }*/
    };
    if (plaid_processor_token) {
      addBank.plaidProcessorToken = plaid_processor_token;
      //addBank.metadata = "";
      addBank.bankAccountType = bank_account_type;//"retail"; //"business"
    } else {
      addBank.bankAddress = bank_address/*{
        bankName:"",
        city:"",
        country:"",
        line1:"",
        line2:"",
        district:""
      }*/;
      if (iban) {
        addBank.iban = iban;
      } else if (accounting_number && routing_number) {
        addBank.accountNumber = accounting_number;
        addBank.routingNumber = routing_number;
      } else return res.status(status).send({ statusText, data: bank });
    }
    const bank = await fetch(
      `https://api-sandbox.circle.com/v1/businessAccount/banks/wires`,
      {
        "Content-Type": "Application/JSON",
        Accept: "Application/JSON",
        body: addBank
      }
    )
      .then(async (res) => await res.json())
      .then((d) => {
        if (plaid_processor_token) await plaidClient.itemAccessTokenInvalidate({ access_token });
        return d.data
      });

    res.status(status).send({ statusText, data: bank });
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
  /*.post("/deposit", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { access_token, amount } = request.body;

    //https://stackoverflow.com/questions/40473684/is-a-plaid-access-token-a-secret
    //"If the user gains access to another user's access_token,
    //they could send that to your API, and get access to a different user's account."

    //Isnt a currency worth
    const authorizeAndCreateTransfer = async (access_token) => {
      const { accounts } = await client
        .accountsGet({
          access_token
        })
        .then((d) => d.data);

      const user = {
          legal_name: "FirstName LastName",
          email_address: "foobar@email.com",
          address: {
            street: "123 Main St.",
            city: "San Francisco",
            region: "CA",
            postal_code: "94053",
            country: "US"
          }
        },
        authorization = await client
          .transferAuthorizationCreate({
            access_token,
            account_id: accounts[0].account_id,
            type: "credit",
            network: "ach",
            amount: "1.34",
            ach_class: "ppd",
            user
          })
          .then((d) => d.data), //idempotency_key?
        transfer = await client
          .transferCreate({
            idempotency_key: "1223abc456xyz7890001",
            access_token,
            account_id: accounts[0].account_id,
            authorization_id: authorization.id,
            type: "credit",
            network: "ach",
            amount: "12.34",
            description: "Payment",
            ach_class: "ppd",
            user
          })
          .then((d) => d.data);
      return transfer.id;
    };

    res.status(status).send({
      statusText,
      data: await plaidClient
        .transferGet({
          transfer_id: await authorizeAndCreateTransfer(access_token)
        })
        .then((d) => d.data)
    });
  })*/
  .listen(port, () => console.log(`localhost:${port}`));
