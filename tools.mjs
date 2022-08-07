import { createRequire } from "module";
const require = createRequire(import.meta.url);
import * as crypto from "crypto";
const session = require('express-session')

let otp1=function(){
	this.chars="";
	for(let i="a";;i=String.fromCharCode(i.charCodeAt(0)+1)){
		this.chars+=i;
		if(i==="z")break;
	};
	this.chars+=this.chars.toUpperCase()
	this.chars+="0123456789"
	this.chars+="@&#"
	this.generate=(len=6)=>{
		let data="";
		for(let i=0;i<len;i++){
			data+=this.chars[crypto.randomInt(0,this.chars.length)];
		}
		return data;
	}
}

export const otp=new otp1();

export function session_login(app){
	let sess = {
  		secret: 'keyboard cat',
  		cookie: {}
	}
	console.log(session);
	app.use(session(sess));
}