require("dotenv").config();
const fetch = require("node-fetch");
const express = require("express");
const { Products } = require('plaid');

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
const transactionsAndLogin = (req, res) => {
  res.set("Content-Type", "Application/JSON");
  var { origin } = req.headers;
  res.set("Access-Control-Allow-Origin", origin);
  var status = 200,
    statusText = "defaultText";
  const { public_token } = request.body
  //https://plaid.com/docs/link/web/#onsuccess
  const access_token = await plaidClient.itemPublicTokenExchange({ public_token }).then(d => d.data);
  /*const accounts_response = await plaidClient.accountsGet({ access_token });
  const accounts = accounts_response.data.accounts;*/
  const accounts = await plaidClient.accountsGet({ access_token }).then(d => d.data);
  const transactions = await plaidClient.transactionsSync({ access_token }).then(d => d.data);
  const authData = await client.authGet({ access_token }).then(d => d.data);
  const identity = await client.identityGet({ access_token }).then(d => d.data);//accounts
  const balance = await client.accountsBalanceGet({ access_token }).then(d => d.data);
  const item = await client.itemGet({ access_token }).then(d => d.data);
  const institution = await client.institutionsGetById({
    institution_id: item.institution_id,
    country_codes: PLAID_COUNTRY_CODES,
  }).then(d => d.data);

  res.status(status).send({
    statusText,
    data: {
      accounts,
      transactions, authData, identity, balance, item, institution
    }
  });
}
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
  .post("/join", async () => {
    const { uid } = request.body;

    const products = (process.env.PLAID_PRODUCTS || Products.Transactions)
      .split(','),
      country_codes = (process.env.PLAID_COUNTRY_CODES || 'US')
        .split(','),
      user = { client_user_id: uid },
      configs = {
        user,
        client_name: `VaultCoin`,
        products,
        country_codes,
        language: 'en',
        redirect_uri: (PLAID_REDIRECT_URI !== '')
          && process.env.PLAID_REDIRECT_URI || '',
        android_package_name: (PLAID_ANDROID_PACKAGE_NAME !== '')
          && process.env.PLAID_ANDROID_PACKAGE_NAME || ''
      };

    res.status(status).send({
      statusText,
      data: { access_token: await client.linkTokenCreate(configs).then(d => d.data) }
    });
  })
  .post("/welcome", transactionsAndLogin)//coatcheck/hello
  .post("/banks", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { access_token, account_ids } = request.body;
    const accounts = await plaidClient.accountsGet({
      access_token,
      options: { account_ids },
    }).then(d => d.data);

    res.status(status).send({ statusText, data: accounts });
  })
  .post("/balance", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { transfer_id, access_token, page } = request.body;

    if (transfer_id)
      return res.status(status).send({
        statusText, data: await plaidClient.transferGet({
          transfer_id
        }).then(d => d.data)
      });

    let results = [];
    let hasMore = true;

    while (hasMore) {
      await client.transactionsSync({
        access_token,
        cursor: page,
      }).then(r => {
        var { added, next_cursor: page, has_more } = r.data;
        // [modified, removed].map(x=>x.concat(x)); 
        results.concat(added)
      })
    }
    res.status(status).send({ statusText, data: results });
  })//move
  .post("/deposit", async (req, res) => {
    res.set("Content-Type", "Application/JSON");
    var origin = req.headers.origin;
    res.set("Access-Control-Allow-Origin", origin);
    var status = 200,
      statusText = "defaultText";

    const { access_token, amount, } = request.body;
    //https://stackoverflow.com/questions/40473684/is-a-plaid-access-token-a-secret
    //"If the user gains access to another user's access_token, 
    //they could send that to your API, and get access to a different user's account."

    const authorizeAndCreateTransfer = async (access_token) => {
      const { accounts } = await client.accountsGet({
        access_token,
      }).then(d => d.data);

      const user = {
        legal_name: 'FirstName LastName',
        email_address: 'foobar@email.com',
        address: {
          street: '123 Main St.',
          city: 'San Francisco',
          region: 'CA',
          postal_code: '94053',
          country: 'US',
        },
      }, authorization =
          await client.transferAuthorizationCreate({
            access_token,
            account_id: accounts[0].account_id,
            type: 'credit',
            network: 'ach',
            amount: '1.34',
            ach_class: 'ppd',
            user,
          }).then(d => d.data),//idempotency_key?
        transfer = await client.transferCreate({
          idempotency_key: '1223abc456xyz7890001',
          access_token,
          account_id: accounts[0].account_id,
          authorization_id: authorization.id,
          type: 'credit',
          network: 'ach',
          amount: '12.34',
          description: 'Payment',
          ach_class: 'ppd',
          user,
        }).then(d => d.data);
      return transfer.id;
    };

    res.status(status).send({
      statusText, data: await plaidClient.transferGet({
        transfer_id: await authorizeAndCreateTransfer(access_token)
      }).then(d => d.data)
    });
  })
  .listen(port, () => console.log(`localhost:${port}`));