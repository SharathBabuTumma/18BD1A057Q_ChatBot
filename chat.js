const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Payload } =require("dialogflow-fulfillment");
const app = express();

const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var randomstring = require("randomstring"); 
var user_name="";

app.post("/dialogflow", express.json(), (req, res) => {
    const agent = new WebhookClient({ 
		request: req, response: res 
		});


async function identify_user(agent)
{
  //console.log("asdf");
  const acct_num = agent.parameters.acct_num;
  console.log(acct_num);
  const client = new MongoClient(url);
  
  await client.connect();
  const snap = await client.db("ForYou").collection("users").findOne({"acc_no": acct_num});
  console.log(snap);
  if(snap==null){
	  await agent.add("Make sure you are already subscribed to our service");

  }
  else
  {
  user_name=snap.name;
  await agent.add("Welcome  "+user_name+"!!  \n How can I help you");}
}
	
function report_issue(agent)
{
 
  var issue_vals={1:"Internet Down",2:"Slow Internet",3:"Buffering problem",4:"No connectivity",5:"No Signal"};
  
  const intent_val=agent.parameters.number;
  console.log(intent_val);
  var val=issue_vals[intent_val];
  
  var trouble_ticket=randomstring.generate(7);

  //Generating trouble ticket and storing it in Mongodb
  //Using random module
  MongoClient.connect(url, function(err, db) {
  if (err) throw "error";
  var dbo = db.db("ForYou");
    
	var u_name = user_name;    
    var issue_val=  val; 
    var status="pending";

	let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    var time_date=year + "-" + month + "-" + date;

	var myobj = { username:u_name, issue:issue_val,status:status,time_date:time_date,trouble_ticket:trouble_ticket };

    dbo.collection("issues").insertOne(myobj, function(err, res) {
    if (err) throw "error";
    db.close();    
  });
 });
 agent.add("The issue reported is: "+ val +"\nThe ticket number is: "+trouble_ticket);
}

//trying to load rich response
function custom_payload(agent)
{
	var payLoadData=
		{
  "richContent": [
    [
      {
        "type": "list",
        "title": "Internet Down",
        "subtitle": "Press '1' for Internet is down",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "list",
        "title": "Slow Internet",
        "subtitle": "Press '2' Slow Internet",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      },
	  {
        "type": "divider"
      },
	  {
        "type": "list",
        "title": "Buffering problem",
        "subtitle": "Press '3' for Buffering problem",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "list",
        "title": "No connectivity",
        "subtitle": "Press '4' for No connectivity",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "list",
        "title": "No signal ",
        "subtitle": "Press '5' Slow Internet",
        "event": {
          "name": "",
          "languageCode": "",
          "parameters": {}
        }
      }
    ]
  ]
}
agent.add(new Payload(agent.UNSPECIFIED,payLoadData,{sendAsMessage:true, rawPayload:true }));
}




var intentMap = new Map();
intentMap.set("service_intent", identify_user);
intentMap.set("service_intent - custom - custom", report_issue);
intentMap.set("service_intent - custom", custom_payload);

agent.handleRequest(intentMap);

});//Closing tag of app.post

app.listen(process.env.PORT || 8080);

/*var express=require("express");
var app=express();
const router=express.Router();
const df=require('dialogflow-fulfillment')
var middleware=require("./middleware");
var server=require("./server");
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='sample';
let db;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
MongoClient.connect(url,{ useNewUrlParser: true },(err,client)=>{
    if(err) return console.log("Error");
    db=client.db(dbName)
    console.log(`Connected to database:${url}`);
    console.log(`Database : ${dbName}`);
});
app.get('/',(req,res)=>{
    res.send("live!!!")
    res.end()
});
app.post("/add", express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });
    
    function action(agent) {
        console.log("Adding details...");
        var name=agent.parameters['person'];
        var mail=agent.parameters['email'];
        var phn =agent.parameters['phone'];
        var query={"phno":phn,"mid":mail,"name":name};
        db.collection('users',function(err,collection){
            collection.insertOne(query,function(err,items){
                if(err) throw "Error";
                console.log("1 data added");
                res.end("1 added"+items);
                res.end();
            });
            
        });
        }
        var intentMap=new Map();
        intentMap.set('Internet',action);
        agent.handleRequest(intentMap);
    });
    
    //module.exports = { welcome: welcome, defaultFallback: defaultFallback };
    
/*app.post('/getdetailsbynumber',function(req,res){
    console.log("Finding details by number...");
    db.collection('users',function(err,collection){
    console.log(req.body.phn);
    var q={phn:new RegExp(req.body.phn)};
    collection.find(q).toArray(function(err,items){
    if (err) throw "Error";
    console.log(items);
    res.send(items);
    res.end();
        });
    });
});
app.post('/add',middleware.checkToken,function(req,res){
    console.log("Adding a user details to collection");
    var phno=req.query.phno;
    var mid=req.query.mid;
    //var status=req.query.status;
    var name=req.query.name;
    //console.log(hid+" "+vid+" "+status+" "+name);
    console.log(phno+mid+name);
    var query={"phno":phid,"mid":mid,"name":name};
    db.collection('user').insertOne(query,function(err,result){
        if(err) console.log("record not inserted");
        res.json("data added");
        //res.json(result);
    });
     
});
app.listen(8080,()=>console.log("server initialized"));*/
