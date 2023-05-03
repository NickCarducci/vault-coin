require("dotenv").config();

const firebaseConfig = {
    apiKey: "AIzaSyCEiWNGlidcYoXLizAstyhxBpyhfBFu3JY",
    authDomain: "vaumoney.firebaseapp.com",
    databaseURL: "https://vaumoney.firebaseio.com",
    projectId: "vaumoney",
    storageBucket: "vaumoney.appspot.com",
    messagingSenderId: "580465804476",
    appId: "1:580465804476:web:5fe118607e434910683cb9"
  },
  { initializeApp } = require("firebase/app"),
  firebase = initializeApp(firebaseConfig), //, "firebase"),
  //"Cannot access 'initializeApp' before initialization"
  {
    getFirestore,
    getDoc,
    doc,
    updateDoc,
    setDoc,
    increment
  } = require("firebase/firestore/lite"), // /lite
  firestore = getFirestore(firebase),
  { initializeApp: initApp, cert } = require("firebase-admin/app"),
  credential = cert(JSON.parse(process.env.FIREBASE_KEY)),
  { getAuth, deleteUser } = require("firebase-admin/auth");
/*FIREBASEAUTH = initializeApp(
    {
      credential,
      databaseURL: "https://vaumoney.firebaseio.com"
    },
    "FIREBASEAUTH"
  ),*/

class FIREBASEAUTH {
  constructor() {
    this.firebaseAoo = initApp /*
      {
        credential,
        databaseURL: "https://vaumoney.firebaseio.com"
      }*/();
    //"The default Firebase app does not exist."
    //https://stackoverflow.com/a/62890190/11711280
    //"FIREBASEAUTH"
  }
  defaultAuth = getAuth(this.firebaseAoo);
  defaultAuth = deleteUser(this.firebaseAoo);
}
const port = 8080,
  allowedOrigins = [
    "https://sausage.saltbank.org",
    "https://i7l8qe.csb.app",
    "https://vau.money",
    "https://jwi5k.csb.app"
  ], //Origin: <scheme>://<hostname>:<port>
  RESSEND = (res, e) => {
    res.send(e);
    //res.end();
  },
  preflight = (req, res) => {
    const origin = req.headers.origin;
    app.use(cors({ origin })); //https://stackoverflow.com/questions/36554375/getting-the-req-origin-in-express
    if (
      [...allowedOrigins, req.body.payingDomains].indexOf(
        req.headers.origin
      ) === -1
    )
      return RESSEND(res, {
        statusCode: 401,
        error: "no access for this origin- " + req.headers.origin
      });
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //"Cannot setHeader headers after they are sent to the client"

    res.statusCode = 204;
    RESSEND(res); //res.sendStatus(200);
  },
  //const printObject = (o) => Object.keys(o).map((x) => {return {[x]: !o[x] ? {} : o[x].constructor === Object ? printObject(o[x]) : o[x] };});
  standardCatch = (res, e, extra, name) => {
    RESSEND(res, {
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
    //if (!res.secure) return true;
    //https://stackoverflow.com/questions/12027187/difference-between-allow-and-access-control-allow-methods-in-http-response-h
  },
  fetch = require("node-fetch"),
  express = require("express"),
  app = express(),
  fill = express.Router(),
  issue = express.Router(),
  attach = express.Router(),
  report = express.Router(),
  disburse = express.Router(),
  actions = express.Router(),
  database = express.Router(),
  cors = require("cors"),
  stripe = require("stripe")(process.env.STRIPE_SECRET);
//FIREBASEAUTH = FIREBASEAUTH.toSource(); //https://dashboard.stripe.com/account/apikeys

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
//https://support.stripe.com/questions/know-your-customer-(kyc)-requirements-for-connected-accounts
issue
  .post("/customer", async (req, res) => {
    //submit that information using the Stripe API
    //vau.money/docs
    //https://stripe.com/docs/connect/identity-verification-api
    //Is this automatic with standard? Should a standard account in good standing
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });

    const newCard = {
      cardholder: req.body.cardholderId,
      currency: "usd",
      type: req.body.type
    }; //make a custom(er) account
    await stripe.issuing.cards
      .create(newCard)
      .then(async (card) => await addCard(req, res, card)) //customer: res.body.storeId
      //payment_method:card.id https://stripe.com/docs/api/setup_intents/create
      .catch((e) => standardCatch(res, e, {}, "create customer"));
  })
  .post("/redo", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    const fresh = {
      cardholder: req.body.cardholderId,
      currency: "usd",
      type: req.body.type, //"virtual", "physical"
      replacement_for: req.body.customerId, //grantorId
      replacement_reason: "expired"
    };
    await stripe.issuing.cards
      .create(fresh)
      .then(async (card) => await addCard(req, res, card))
      .catch((e) => standardCatch(res, e, {}, "forge anew"));
  }); //no use within a month so
// https://stripe.com/docs/payments/payment-intents/creating-payment-intents#creating-for-automatic
const writeCard = async (req, res, newStore, cb) =>
    await stripe.paymentMethods
      .create(newStore)
      .then(async (method) => {
        await stripe.paymentMethods
          .attach(method.id, {
            customer: req.body.customerId
          })
          .then(async (same) => {
            cb(method.id);
          })
          .catch((e) =>
            standardCatch(res, e, { newStore, method }, "attach card")
          );
      })
      .catch((e) => standardCatch(res, e, newStore, "create card")),
  //-pay -out "intent" deferred
  serializeCard = (req, cardId) => {
    return { req, cardId: !cardId ? req.body.storeId : cardId };
  },
  addCard = async ({ req, cardId } = serializeCard, res, name) =>
    await stripe.setupIntents
      .create({
        customer: req.body.customerId,
        payment_method_types: ["card"],
        payment_method: cardId //https://stripe.com/docs/api/setup_intents/create
      }) //storeID  //trustValueIssueId
      .then(async (newIntent) => {
        //const newIntent = "seti_1McfOX2eZvKYlo2CrdZza7Cc"
        await stripe.setupIntents
          .confirm(newIntent.id, {
            payment_method: cardId // "pm_card_visa"
          })
          .then(() => {
            RESSEND(res, {
              statusCode,
              statusText,
              cardId
            });
          })
          .catch((e) =>
            standardCatch(res, e, { newIntent }, "confirm " + name)
          );
      })
      .catch((e) => standardCatch(res, e, { cardId }, "create " + name)),
  serializePayment = (req, cardId) => {
    return {
      req,
      newPay: {
        //setup_future_usage: true,
        customer: req.body.customerId,
        payment_method: !cardId ? req.body.storeId : cardId, //method.id,
        amount: req.body.total, //2000,
        currency: req.body.currency ? req.body.currency : "usd",
        //https://stripe.com/docs/connect/destination-charges
        automatic_payment_methods: { enabled: true },
        //Do you need to report rolling over investment accounts as a 1031 exchange to yourself?
        //Are Stripe Connect manual interval customer payment intents paid out in
        //3 year intervals ascending? Does each payment need to rollover to keep the
        //payout from the account from happening?
        transfer_data: {
          destination: req.body.storeId //method.id //"{{CONNECTED_STRIPE_ACCOUNT_ID}}"
        }
      }
    };
  },
  pay = async ({ req, newPay } = serializePayment, res, name) => {
    await stripe.paymentIntents
      .create(newPay)
      .then(async (pay) => {
        // https://stripe.com/docs/payments/payment-intents/creating-payment-intents#creating-for-automatic
        await stripe.paymentIntents
          .confirm(pay.id, {
            //setup_future_usage: "on_session",//method without a customer..
            payment_method: req.body.storeId //"pm_card_visa" methodId
          })
          .then((payment) => {
            RESSEND(res, {
              statusCode,
              statusText,
              payment
            });
          })
          .catch((e) =>
            standardCatch(res, e, { newPay, pay }, "confirm " + name)
          );
      })
      .catch((e) => standardCatch(res, e, newPay, "create " + name));
  };
var mccIdTimeouts = {},
  mccIdTimeoutNames = [];
const cancel = async (req, res) => {
  const subscription = await stripe.subscriptions.update(
    req.body.subscriptionId, //"sub_1Mh3dW2eZvKYlo2CPPWaZEw2",
    {
      cancel_at_period_end: true
    }
  );
};
const subscription = async (req, res) => {
  //not recurring, billing, but subscriptions
  //https://stripe.com/docs/api/subscriptions/create
  const masterId = ""; //acct
  // https://stripe.com/docs/payments/payment-intents/creating-payment-intents#creating-for-automatic
  //pay(req, res, newPurchase, "pay");
  //confirm: true  //confirm API params may be provided
  //https://stripe.com/docs/api/products/list
  const product = await stripe.products.create({
    name: "Gold Special"
  });
  const price = await stripe.prices.create({
    //https://stripe.com/docs/api/prices/create
    unit_amount: 2000,
    currency: "usd",
    recurring: { interval: "month" },
    product: "prod_NSHBecgDdPe12v"
  });
  if (!price.id) return RESSEND(res, failOpening(req, "price"));
  const subscription = await stripe.subscriptions.create({
    customer: req.body.customerId, //'cus_NPxJYWnCjCv6pT',
    items: [
      {
        price: price.id, // "price_1Mh3dW2eZvKYlo2C421PQYlQ",
        price_data: {
          currency: "usd",
          product: "",
          recurring: {
            interval: "month",
            interval_count: 1
          },
          unit_amount_decimal: 5.0
        },
        quanity: 1,
        tax_rates: ""
      }
    ],
    cancel_at_period_end: false
  });
  if (!subscription.id) return RESSEND(res, failOpening(req, "subscription"));
  //RESSEND(res,{  statusCode, statusText, subscriptionId:
  return subscription.id;
};
var lastLink; //function (){}//need a "function" not fat scope to hoist a promise function? NOPE. //Neither. async in express
/*const serializePerson = (req, person_token) => {
  return {
    first_name: req.body.first,
    last_name: req.body.last,
    person_token
  };
};*/ const failOpening = (
    req,
    on
  ) => {
    return {
      statusCode: 402,
      statusText: "no storeId go " + on,
      error: {
        body: req.body,
        query: req.query,
        origin
      }
    };
  },
  cardOptions = (req) => {
    return {
      type: req.body.type, //"customer_balance"//"us_bank_account" "card"
      ...(req.body.type === "card"
        ? {
            card: {
              number: req.body.primary, //16-digit primary,
              exp_month: req.body.exp_month, //no zero-digit padding
              exp_year: req.body.exp_year,
              cvc: req.body.security
            }
          } //newCard
        : {
            us_bank_account: {
              account_holder_type: "company", //"individual"
              account_number: req.body.account,
              account_type: "checking", //"savings"
              routing_number: req.body.routing
            }
          }), //newBank
      billing_details: {
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        name: req.body.name
      }
    };
  };
const requirebody = (req, res) =>
    !req.body && RESSEND(res, failOpening(req, "account")),
  originbody = (req, res, body) => {
    var origin = req.query.origin;
    if (!origin) {
      origin = req.headers.origin;
      body && requirebody(req, res);
      //"no newaccount made body",  //...printObject(req) //: origin + " " + (storeId ? "storeId" : "")
    }
    return origin;
  };
attach
  .post("/add", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    await writeCard(req, res, cardOptions(req), (cardId) =>
      addCard((req, cardId), res, "add")
    );
  })
  .post("/pay", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    writeCard(req, res, cardOptions(req), (cardId) =>
      pay((req, cardId), res, "pay")
    );
  })
  .post("/buy", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });

    const cus = await /*promiseCatcher(
        r,
        "customer",*/
    stripe.customers.create(req.body.customer);
    if (!cus.id) {
      return RESSEND(req, failOpening(req, "customer"));
    }
    const ich = await /*promiseCatcher(
    r,
    "cardholder",*/
    stripe.issuing.cardholders.create(req.body.cardholder);
    if (!ich.id) {
      return RESSEND(req, failOpening(req, "cardholder"));
    }

    getDoc(doc(firestore, "userDatas", req.body.uid)).then((d) => {
      var kv = {};
      const digits = String(req.body.mcc).substring(0, 2),
        customer = `customer${digits}Id`,
        cardholder = `cardholder${digits}Id`;
      kv[customer] = req.body.customerId;
      kv[cardholder] = req.body.cardholderId;
      //kv.invoice_prefix = store.invoice_prefix;
      (d.exists() ? updateDoc : setDoc)(
        doc(firestore, "userDatas", req.body.uid),
        kv
      )
        .then(() => {
          RESSEND(res, {
            statusCode,
            statusText: "successful accountLink",
            kv
          });
        })
        .catch((e) =>
          standardCatch(res, e, {}, "firestore customer id (then callback)")
        ); //plaidLink payouts account.details_submitted;
    });
    RESSEND(req, { statusCode, statusText, customer: cus, cardholder: ich });
  })
  /*.post("/assess", async (req, res) => {
    //assessment (the) paymentMethod "link" to account
    if (allowOriginType(req.headers.origin, res)) 
     return RESSEND(res, { statusCode, statusText:"not a secure origin-referer-to-host protocol" });;
    //if (!customer) customer = await stripe.customers.create({});
    //https://stripe.com/docs/api/customer_bank_accounts/create
    const bank = await stripe.customers.createSource(req.body.storeId, {
      source: req.body.cardId
      //uk? "btok_1Mbw5RGVa6IKUDzp8AcbQaBG"
    });
    end({ bankId: bank.id });
  })*/
  .post("/join", async (req, res) => {
    //Can you call to resolve an asynchronous function from Express middleware that's
    //declared in the Node.js process' scope?
    var origin = originbody(req, res, true);
    if (allowOriginType(origin, res))
      return RESSEND(res, {
        statusCode,
        statusText,
        progress: "yet to surname factor digit counts.."
      });
    /*return res.send({
      statusCode,
      statusText,
      why: "no work"
    });*/
    /**
     * Decrement merchantSurnamePrefix count
     *
     *
     */
    const prefixMap = async (
      merchantSurnamePrefix /* = async (res) => {
        const json = JSON.parse(res);
        return json;
      }*/
    ) => {
      //const totalMerchantSurnames =
      /*await getDoc(doc(firestore, "merchantSurnames", merchantSurnamePrefix))
        .then((d) => {
          (d.exists() ? updateDoc : setDoc)(
            doc(firestore, "merchantSurnames", merchantSurnamePrefix),
            { count: increment(1) }
          );
          return { ...d.data(), id: d.id }.count + 1;
        })
        .catch((err) => {
          console.log(
            "deleted; surname update,set, or get failure: ",
            err.message
          );
          return err;
        });
      return null;*/
    }; //Just do on front end
    req.body.merchantSurnamePrefixes.forEach((merchantSurnamePrefix) => {
      prefixMap(merchantSurnamePrefix);
    });
    /*RESSEND(res, {
      statusCode,
      statusText,
      progress: "beyond surname factor digit counts"
    });*/
    /**
     * Delete accounts
     *
     *
     */
    /*const deletethisone = async (x) => {
      await new Promise((r) =>
        stripe.accounts.del(x).then(async () => {
          r("{}");
        })
      );
    };*/
    const deleteThese = req.body.deleteThese; // ["acct_1MkydPGfCRSE0xBF"]; //sandbox only! ("acct_")
    deleteThese &&
      deleteThese.constructor === Array &&
      Promise.all(
        deleteThese.map(
          async (x) =>
            await new Promise((r) =>
              stripe.accounts.del(x).then(async () => {
                r("{}");
              })
            )
          /*async (x) => {
            try {
              return deletethisone(x);
            } catch (e) {
              RESSEND(res, failOpening(req, "accounts"));
            }
          }*/
        )
      )
        .then(prefixMap)
        .catch((err) => {
          console.log("delete error: ", err.message);
          return err;
        });
    /*RESSEND(res, {
      statusCode,
      statusText,
      progress: "beyond sinking customers / deletion accounts"
    });*/
    /* Don't delete customers
    
    const sinkThese = req.body.sinkThese; // []; //sandbox only! ("cus_")
      sinkThese &&
        sinkThese.constructor === Array &&
        sinkThese.forEach(async (x) => {
          try {
            const cus = await stripe.customers.update(x, {
              invoice_prefix: "TEST" + x.substring(0, 7)
            });
            if (!cus.id) return RESSEND(res, failOpening(req, "customer"));
            await stripe.customers.del(cus.id);
          } catch (e) {
            RESSEND(res, failOpening(req, "customer"));
          }
        });*/
    //RESSEND(res, { statusCode, statusText, status: "declared deleter" });
    //"Sorry, you're creating accounts too quickly. You should
    //limit your requests to less than 5 creation attempts per
    //second with a test key, or less than 30 with a live key."
    var error = null;
    /*const promiseCatcher = async (R, reason, call, args) =>
      new Promise(async (r) => {
        await call(args)
          .then((res) => {
            const done = JSON.stringify(res);
            r(done);
          })
          .catch((e) => R(`{error:${JSON.stringify(e)},reason:${reason}}`));
      });*/
    /**
     * Begin process accounts and customer creation
     *
     *
     */
    await Promise.all(
      //account_token: body.newAccount.account_token
      //https://stripe.com/docs/connect/account-tokens
      req.body.accounts.map(
        async (_acct, i) =>
          await new Promise(async (r, reject) => {
            //RESSEND(res, { statusCode, statusText, status: "ran deleter" });
            //dangerous; assumes one: storeId-kv (without newAccount field)
            if (!_acct.newAccount) return r(`{id:${Object.values(_acct)[0]}}`); //RESSEND(res,);
            const name = _acct.newAccount.business_profile.mcc,
              acct = await /*promiseCatcher(r, "create",*/ stripe.accounts.create(
                {
                  type: _acct.type,
                  country: _acct.country,
                  ..._acct.newAccount
                }
              );
            if (!acct.id) {
              error = "account";
              return r(`{error:${error}}`);
            }
            mccIdTimeoutNames.push(name);
            mccIdTimeouts[name] = setTimeout(
              async ({
                person,
                companyAccount,
                customer,
                cardholder
              } = _acct) => {
                if (error) return r(`{error:${error}}`);
                const person_ = await /*promiseCatcher(
                  r,
                  "person",*/
                stripe.accounts.createPerson(acct.id, {
                  first_name: req.body.first,
                  last_name: req.body.last,
                  person_token: person.account_token
                });

                if (!person_.id) {
                  error = "person";
                  return r(`{error:${error}}`);
                }
                const acct_ = await /*promiseCatcher(
                  r,
                  "update",*/
                stripe.accounts.update(acct.id, {
                  account_token: companyAccount.account_token
                });

                if (!acct_.id) {
                  error = "update";
                  return r(`{error:${error}}`);
                }
                const store = JSON.stringify({
                  //invoice_prefix: customer.invoice_prefix,
                  name,
                  id: acct_.id
                  //customerId: cus.id
                  //cardholderId: ich.id
                  //accountLink
                });
                return store && r(store);
              },
              error ? 0 : 5000 * i
            ); //return promise
          })
      )
    )
      .then(
        async (
          accounts = (a) =>
            a.map((st, i) => {
              const p = JSON.parse(st);
              return p;
            })
        ) => {
          if (!accounts.every((x) => x.constructor === Object && !x.error))
            return RESSEND(res, failOpening(req, error));
          //if (error) return null;
          error = null;
          //RESSEND(res, { statusCode, statusText, status: "made accounts" });
          /**
           * Begin process link
           *
           *
           */
          await Promise.all(
            accounts.map(
              async (store, i) =>
                //return await new Promise((r) => r(String(obj)));
                await new Promise((r, reject) => {
                  mccIdTimeoutNames.push(store.id);
                  mccIdTimeouts[store.id] = setTimeout(
                    async () => {
                      if (error) return r(`{error:${error}}`);
                      const accLink =
                        /*promiseCatcher(
                        r,
                        "accountLink",*/
                        stripe.accountLinks.create({
                          account: store.id, //: 'acct_1032D82eZvKYlo2C',
                          return_url: i === 0 ? origin : lastLink, // + "/prompt=" + req.body.uid,
                          refresh_url: `https://vault-co.in/join?account=${store.id}&origin=${origin}`, //account.id
                          //"The collect parameter is not valid when creating an account link of type `account_onboarding` for a Standard account."
                          //collect: "eventually_due"
                          type: "account_onboarding"
                        });
                      if (!accLink) {
                        error = "accountLink";
                        return r(`{error:${error}}`);
                      }
                      lastLink = accLink.url;
                      //name, id, customerId, cardholderId
                      store.accountLink = accLink;
                      const account = store && JSON.stringify(store);
                      return account && r(account);
                    },
                    error ? 0 : 5000 * i
                  );
                })
            )
          )
            .then((accounts = (a) => a.map((st, i) => JSON.parse(st))) => {
              //const subscriptionId = subscription();
              if (!accounts.every((x) => x.constructor === Object && !x.error))
                return RESSEND(res, failOpening(req, error));
              /**
               * Begin process update userDatas with key-value object
               *
               *
               */
              getDoc(doc(firestore, "userDatas", req.body.uid)).then((d) => {
                var keyvalue = {};
                accounts = accounts.map((store) => {
                  var kv = {};
                  const digits = String(store.name).substring(0, 2),
                    link = `stripe${digits}Link`,
                    id = `stripe${digits}Id`;
                  //customer = `customer${digits}Id`,
                  //cardholder = `cardholder${digits}Id`;
                  kv[link] = store.accountLink;
                  kv[id] = store.id;
                  //kv[customer] = store.customerId;
                  //kv[cardholder] = store.cardholderId;
                  //kv.invoice_prefix = store.invoice_prefix;
                  return kv;
                });
                accounts.forEach((store) => {
                  Object.keys(store).forEach((key) => {
                    keyvalue[key] = store[key];
                  });
                });
                (d.exists() ? updateDoc : setDoc)(
                  doc(firestore, "userDatas", req.body.uid),
                  keyvalue
                )
                  .then(() => {
                    RESSEND(res, {
                      statusCode,
                      statusText: "successful accountLink",
                      accounts
                    });
                  })
                  .catch((e) =>
                    standardCatch(
                      res,
                      e,
                      {},
                      "firestore store id (then callback)"
                    )
                  ); //plaidLink payouts account.details_submitted;
              });
            })
            .catch((e) =>
              standardCatch(
                res,
                e,
                { accounts },
                "accountLinks (then callback)"
              )
            );
        }
      )
      .catch((e) => standardCatch(res, e, {}, "accounts (then callback)"));
    //return res.redirect(accountLink.url);
  });
const end = (res, data, name) =>
  RESSEND(res, {
    statusCode,
    statusText,
    [name]: data
  });

//https://stripe.com/docs/api/sources/object#source_object-type
const payout = async (req, res, cb, name) => {
  const b = req.body,
    method =
      (b.currency === "usd" && b.stripeId === "card") ||
      (b.curreny === "gbp" && b.stripeId === "ach_debit")
        ? "instant"
        : "standard";
  await stripe.payouts
    .create(
      {
        method,
        amount: req.body.total,
        currency: req.body.currency,
        destination: req.body.cardId,
        //stripeAccount: req.body.storeId,
        source_type: req.body.source_type
      },
      {
        //https://stripe.com/docs/connect/manual-payouts#regular-payouts
        stripeAccount: req.body.stripeId
      }
    )
    //https://stackoverflow.com/questions/66314976/how-to-payout-to-a-connected-user-move-funds-from-connected-users-stripe-accou
    .then((payout) => {
      cb();
      end(res, payout, "payout");
    })
    .catch((e) => standardCatch(res, e, {}, name));
};
disburse
  .post("/payout", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //https://stripe.com/docs/api/payouts/create
    payout((req, null), res, () => {}, "payout");
  })
  .post("/degrade", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    payout(
      (req, null),
      res,
      async () =>
        await stripe.accounts
          .del(req.body.storeId)
          .then((card) => end(res, card, "card"))
          .catch((e) => standardCatch(res, e, {}, "delete live account")),
      "degrade"
    ); //https://stripe.com/docs/api/payouts/create
  });
//payout, addCard
fill
  .post("/scope", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    await stripe.issuing.cards //grantorId
      .update(req.body.cardholderId, {
        cardholder: req.body.cardholderId, // "ich_1Mcw4tGVa6IKUDzpY8sdgghT",
        currency: "usd",
        type: req.body.type, //"virtual", "physical"
        spending_controls: {
          spending_limits: {
            amount: req.body.total,
            interval: "per_authorization"
            //categories: ["1520"] //mcc, 8099, 8299?
          }
        }
      })
      .then((card) => {
        RESSEND(res, {
          statusCode,
          statusText,
          card
        });
      })
      .catch((e) => standardCatch(res, e, {}, "returns"));
  })
  //intent-method, confirm-attach, payout
  .post("/fill", (req, res) => {
    //this fills a card that isn't saved
    //spend issuance from primary transfers
    //Does issuing payout banks or primary interchange cards obligate the seller to pay all assessment fees?
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    writeCard(req, res, cardOptions(req), (cardId) => {
      //https://stripe.com/docs/api/payouts/create
      payout((req, cardId), res, () => {}, "create payout"); //newPayout
    });
  });

database.post("/deleteemail", async (req, res) => {
  if (allowOriginType(req.headers.origin, res))
    return RESSEND(res, {
      statusCode,
      statusText: "not a secure origin-referer-to-host protocol"
    });
  var auth = req.body;
  await deleteUser(auth)
    .then(async () => {
      var email = auth.email;
      delete auth.email;
      delete auth.emailVerified;
      delete auth.password;
      await getAuth(FIREBASEAUTH)
        .createUser(auth)
        .then((w) =>
          RESSEND(res, {
            statusCode,
            statusText,
            message: `user ${auth.uid} successfully removed ${email} from firebase and firestore`,
            data: w // resp
          })
        )
        .catch((err) => standardCatch(res, err, { email }, "createUser"));
    })
    .catch((err) => standardCatch(res, err, { auth }, "deleteUser"));
});

const stripePage = ({ last, next } = (t) => t) => {
  //const { last, next } = intertemporal;
  return {
    created: {
      gte: last, //descending recent top
      lte: next //undo older query
    },
    starting_after: last,
    ending_before: next,
    limit: 3
  };
};
report
  .post("/find", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    const account =
      req.body.stripeId &&
      (await stripe.accounts.retrieve(
        req.body.stripeId //acct
      ));
    if (account && !account.id)
      return RESSEND(res, failOpening(req, "account"));
    const customer =
      req.body.customerId &&
      (await stripe.customers.retrieve(req.body.customerId)); //cus
    if (customer && !customer.id)
      return RESSEND(res, failOpening(req, "account"));
    //if (account.capabilities.card_issuing !== "inactive") {
    const cardholder =
      req.body.cardholderId &&
      (await stripe.issuing.cardholders.retrieve(req.body.cardholderId)); //ich https://stripe.com/docs/issuing/connect/cardholders-and-cards
    if (cardholder && !cardholder.id)
      return RESSEND(res, failOpening(req, "account"));

    RESSEND(res, {
      statusCode,
      statusText,
      account,
      customer,
      cardholder
    });
  })
  //https://support.stripe.com/questions/alternatives-for-filtering-the-list-balance-transactions-api-using-available-on
  .post("/search", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //https://stripe.com/docs/search#search-query-language
    const serialize = (array) =>
        array.map(
          (kv) => `${Object.keys(kv)[0]}:\\'${Object.values(kv)[0]}\\'`
        ),
      query = req.body.terms
        .map(
          (kv) =>
            `metadata[\\'${Object.keys(kv)[0]}\\']:${Object.values(kv)[0]}`
        )
        .concat(serialize(req.body.where))
        .join(" AND ");
    //https://stripe.com/docs/api/payment_intents/search
    await stripe.paymentIntents
      .search({
        query,
        page: req.body.next_page,
        limit: req.body.limit //1-100 (10)
      }) //benefactor rate
      .then(async (tr) => {
        //https://stripe.com/docs/search#multiple-filters
        await stripe.transfers
          .search({
            //https://stripe.com/docs/stripe-data/write-queries
            query //doesn't exist?
          })
          .then((re) => {
            RESSEND(res, {
              statusCode,
              statusText,
              transfers: tr.data,
              returns: re.data,
              next_page: tr.next_page
            });
          })
          .catch((e) =>
            standardCatch(res, e, { query, transfers: tr.data }, "returns")
          );
      })
      .catch((e) => standardCatch(res, e, query, "transfers"));
  })
  .post("/transfers", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //https://stripe.com/docs/api/payment_intents/list#list_payment_intents-customer
    const pagination = stripePage({ last: req.body, next: req.body.next });
    await stripe.paymentIntents
      .list({
        customer: req.body.customerId,
        ...pagination
      })
      .then(async (transfers) => {
        await stripe.transfers
          .list({
            destination: req.body.storeId,
            ...pagination
          })
          .then((returns) => {
            //https://stripe.com/docs/api/transfers/list
            RESSEND(res, {
              statusCode,
              statusText,
              pagination,
              transfers,
              returns
            });
          })
          .catch((e) =>
            standardCatch(res, e, { pagination, transfers }, "returns")
          );
      })
      .catch((e) => standardCatch(res, e, pagination, "transfers"));
  })
  .post("/maintenance", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //https://stripe.com/docs/api/balance_transactions/retrieve
    const pagination = stripePage({ last: req.body, next: req.body.next });
    await stripe.balanceTransactions
      .list({
        type: "transfer",
        ...pagination
      })
      .then((maintenance) => {
        RESSEND(res, {
          statusCode,
          statusText,

          maintenance
        });
      })
      .catch((e) => standardCatch(res, e, {}, "transfer maintenance"));
  })
  .post("/integrity", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //https://docs.digitalocean.com/products/app-platform/how-to/view-logs/
    await fetch(
      `https://api.digitalocean.com/v2/apps/{app_id}/deployments/{deployment_id}/components/{component_name}/logs`,
      {
        headers: {
          Authorization: `bearer ${process.env.DIGITAL_OCEAN_TOKEN}`
        }
      }
    )
      .then((buildlogs) => {
        RESSEND(res, {
          statusCode,
          statusText,
          buildlogs
        });
      })
      .catch((e) => standardCatch(res, e, {}, "buildlogs integrity"));
  });
actions
  .post("/purchase", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //https://stripe.com/docs/api/payment_intents/create
    //automatic_payment_methods: { enabled: true }
    //confirm: true  //confirm API params may be provided
    // https://stripe.com/docs/payments/payment-intents/creating-payment-intents#creating-for-automatic
    pay((req, null), res, "pay");
  }) //payment-purchase
  .post("/w2", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    //Is a wage an hourly salary? Is a salary always monthly?
    pay((req, null), res, "w2");
  })
  .post("/advance", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    pay((req, null), res, "advance");
  })
  //Can a business pay in excess of mark to market prices to later pay back their
  //limited partnership with tax free income instead of
  //just 80% net operating loss carry back refunds, forward deductions, and
  //near 100% over state usury level interest?
  .post("/loan", async (req, res) => {
    if (allowOriginType(req.headers.origin, res))
      return RESSEND(res, {
        statusCode,
        statusText: "not a secure origin-referer-to-host protocol"
      });
    const principal = req.body.loan;
    pay((req, null), res, "loan as interest");
  });
//https://stackoverflow.com/questions/31928417/chaining-multiple-pieces-of-middleware-for-specific-route-in-expressjs
app.use(nonbody, issue, attach, disburse, fill, database, report, actions); //methods on express.Router() or use a scoped instance
app.listen(port, () => console.log(`localhost:${port}`));
process.stdin.resume(); //so the program will not close instantly
function exitHandler(exited, exitCode) {
  if (exited) {
    mccIdTimeoutNames.forEach((x) => clearTimeout(mccIdTimeouts[x]));
    console.log("clean");
  }
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (exited.mounted) process.exit(); //bind-only not during declaration
} //bind declare (this,update) when listened on:
process.on("uncaughtException", exitHandler.bind(null, { mounted: true }));
process.on("exit", exitHandler.bind(null, { clean: true }));
