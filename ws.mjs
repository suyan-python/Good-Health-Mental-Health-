import { createRequire } from "module";
const require = createRequire(import.meta.url);

const WS=require('express-ws');
import  DB from "./db.mjs";
//const wss = new WebSocketServer({ port: 8080 });
const WS_DB={};
export function webSocket(app){
	const wss=new WS(app);
	/*app.on("upgrade",async(request, socket, head)=>{
		if(!request.session.User){
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    		socket.destroy();
    		return;
    	}
    	wss.handleUpgrade(request, socket, head, function done(ws){
    		wss.emit('connection', ws, request, client);
  		})
	});*/
	app.ws('/helper',async (ws,req)=>{
		console.log("in helper!!");
		if(!req.session.User){
			console.log("plz login to ascess ws bsdk;")
			ws.close();
			return;
		}
		let temp_data={
			id:req.session.User._id,
			name:req.session.User.name,
			role:'doctor',
		}
		let on=await DB.Online.save(temp_data);
		ws._id=on._id;
		ws.on("close",()=>{
 	 		console.log("[+]ending close");
 	 		DB.Online.delete({_id:ws._id});
 	 	});

	})

	app.ws('/', async function(ws, req) {
		if(!req.session.User){
			console.log("plz login to ascess ws bsdk;")
			ws.close();
			return;
		}
		let temp_data={
			id:req.session.User._id,
			name:req.session.User.name,
			role:req.session.User.role,
		}
		let on=await DB.Online.save(temp_data);
		ws._id=on._id;
		//req.session.User.ws_id=on._id;
		WS_DB[req.session.User._id]=req.session.User
  		ws.on('message', async function(msg) {
  			let data=JSON.parse(msg);
  			console.log(msg);
    		if(data.method=="request"){
    			//let temp=await DB.Online.get({id:data.req_id});
    			let temp1=await DB.Request.get({from:req.session.User._id,to:data.req_id});
    			if(!temp1){
    				console.log("sup mfmfmmfmfmfmf!!");
    				
    				let da=await DB.Request.save({from:req.session.User._id,to:data.req_id});
    				if(WS_DB[data.req_id])WS_DB[data.req_id].send(JSON.stringify({
    					method:"request",
    					id:da._id

    				}))
    				//ws.send(JSON.stringify({status:200});
    			}
    		}else if(msg.method=="accept"){
    			temp=await DB.Request.get({_id:data.id});
    			if(temp){
    				temp=await DB.Chat.get(temp);
    				if(temp){
    					await DB.Chat.update(temp._id,{time:Date.now()});

    				}else{
    					delete temp._id;
    					await Db.Chat.save(temp);
    				}
    			}
    		}else if(msg.method=="msg"){
    			let temp=DB.Message.get({});
    			
    		}
 	 	});
 	 	ws.on("close",()=>{
 	 		console.log("[+]ending close");
 	 		DB.Online.delete({_id:ws._id});
 	 	});
	});
	const CHAT_DB={};
	app.ws("/chat",async(ws,req)=>{
		CHAT_DB[req.session.User._id]=ws;
		ws.on('message', async function(msg) {
			let data=JSON.parse(msg);
			if(CHAT_DB[data.to]){
				console.log("wss://socekt mf!")
				CHAT_DB[data.to].send(msg);
			}
			
		})

	})


}
/*server.on("upgrade",async(request, socket, head)=>{
	if(!reques.session.user){
		socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    	socket.destroy();
    	return;
	}
	wss.handleUpgrade(request, socket, head, function done(ws) {
    	wss.emit('connection', ws, request, client);
  	}

})

wss.on('connection', (ws) =>{
	//register online;
	DB.Online.save(req.session.User);
	WS_DB[req.session.User._id]=ws;
	ws.on('message',async (data)=> {
		data=JSON.parse(data);
		if(data.action=="chat"){
			if(DB.Inbox.exist({user1:req.session.user._id}) || )
		}
		ws.send("No action found!");
	});
	
	ws.on("close",(data)=>{
		DB.Online.delete({_id:req.session._id});
	})

});

export*/ 