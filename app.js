import { createRequire } from "module";
const require = createRequire(import.meta.url);

import * as http from 'http';
const express = require('express');
const fs=require("fs");
import  DB from "./db.mjs";
import {otp,session_login} from "./tools.mjs";
import {webSocket} from "./ws.mjs";

const app = express()
const port = 3000

session_login(app);

app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://192.168.0.115:8000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials",true)
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
    next();
});


function required_login(req,res,next){
  return;
};


app.get('/', (req, res) => {
  res.sendFile("./index.html",{root: process.cwd() });
})

app.post('/register', async (req, res) => {
  let data;
  if(req.body.otp){
    data=await DB.TempUser.get({otp:req.body.otp,number:req.body.number});
    if(data){
      req.body.isAdmin=false;
      DB.TempUser.delete({_id:data._id});
      await DB.User.save(req.body);
      res.send("ok");
    }else{
      res.send("otp/number not matched!",404);
    };
  }else{
    data=await DB.User.exist({number:req.body.number});
    if(data){
      res.send("User already exist",404);
      return;
    }
    data=await DB.TempUser.exist({number:req.body.number});
    if(data){
      res.send("wait for some minute",404);
      return;
    }
    data=await DB.TempUser.save({number:req.body.number,otp:otp.generate()});
    console.log("[*]otp:"+data.otp);
    res.send("otp sent");
  }
});

app.post("/login",async(req,res)=>{
 
  if(req.session.User){
    console.log(req.session.User);
    console.log(req.session.id);
    res.send("LOGOUT MF!!",404)
    return;
  }
  let data=await DB.User.get({"number":req.body.number});
  if(data){
    let isEqual=await DB.User.pword.compare(req.body.pword,data.pword)
    if(isEqual){
      req.sessionStore.destroy(data.sessionID);
      req.session.User=data;
      let temp=await DB.User.edit(data._id,{sessionID:req.session.id});
      console.log("[*]"+data.number+" loged id"+","+req.session.id);
      res.send(JSON.stringify({uid:data.uid,number:data.number,_id:data._id}));
      return;
    }
  }
  res.send("username/password incorrect",404);
})
app.get("/check",async(req,res)=>{
  if(req.session.User){
    res.send("loged is as :"+req.session.User.name);
  }else{
    res.send("no session found!");
  }
})

app.post("/logout",async(req,res)=>{
  req.session.destroy((err)=>{
    if(err)res.send("No session found",404);
    res.send("Logged Out",200);
  })
})

app.get("/online/:db",async(req,res)=>{
  let data=[];
  console.log(req.params);
  if(req.params.db=="helper" || req.params.db=="doctor"){
    data=await DB.Online.query({role:req.params.db});
  }
  res.send(JSON.stringify(data));

});

app.get("/get/:db",async(req,res)=>{
  if(req.params.db=="request"){
    let data=await DB.Request.query({to:req.session.User._id});
    res.send(JSON.stringify(data));
    console.log("ma chicken!!");
    console.log(data);
    console.log(req.session.User._id);
  };
  if(req.params.db=="chats"){
    let da=await DB.Chat.query({$or:[{to:req.session.User._id},{from:req.session.User._id}]});
    console.log(da);
    res.send(JSON.stringify(da));
  }
})
app.post("/request",async(req,res)=>{
  if(req.body.action=="reject"){
    let data=await DB.Request.delete({_id:req.body.id});
    res.send("ok");
  }else{
    let temp=await DB.Request.get({_id:req.body.id});  
    delete temp._id;
    await DB.Chat.save(temp);
    let data=await DB.Request.delete({_id:req.body.id});
     res.send(JSON.stringify(data));
  }
})
app.get("/user/:idd",async(req,res)=>{
  let data=await DB.User.get({_id:req.params.idd});
  res.send(JSON.stringify(data));
})


app.post("/json",async(req,res)=>{
  fs.writeSync(res.body);
})


webSocket(app);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

