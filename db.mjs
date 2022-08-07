import {sqlite3} from "./db/sqlite3.mjs";
import {NoSql} from "./db/prototype.mjs";
import {nedb} from "./db/nedb.mjs";
//import {otp} from "./tools.mjs";

let  DB={};
class User extends nedb{
	constructor(){
		super("./database/");
		this.name=new NoSql.CharField({length:20});
		this.number=new NoSql.CharField({length:11});
		this.pword=new NoSql.PasswordField();
		this.isAdmin=new NoSql.BooleanField();
		this.image=new NoSql.FileField({NULL:true});
		this.role=new NoSql.OptionField({options:["user","doctor"]})
	}
}

DB.User=new User();

class TempUser extends nedb{
	constructor(){
		super("./database/");
		this.number=new NoSql.CharField({length:11});
		this.otp=new NoSql.CharField({length:7});
	};
	async save(data){
		let res=await super.save(data);
		setTimeout(async ()=>{
			await this.delete({_id:res._id});
			console.log("[*]deleted "+res._id);
		},60000*3)
		return res; 
	}

};
DB.TempUser=new TempUser();

class Online extends nedb{
	constructor(){
		super("./database/");
		this.id=new NoSql.CharField({length:20});
		this.name=new NoSql.CharField({length:20});
		this.image=new NoSql.FileField({NULL:true});
		this.role=new NoSql.OptionField({options:["user","doctor"]})
	}
};
DB.Online=new Online();
class Request extends nedb{
	constructor(){
		super("./database/");
		this.from=new NoSql.CharField({length:20});
		this.to=new NoSql.CharField({length:20});
	}
	async save(data){
		let res=await super.save(data);
		setTimeout(async ()=>{
			await this.delete({_id:res._id});
			console.log("[*]deleted "+res._id);
		},60000*1)
		return res; 
	}

};
DB.Request=new Request();

class Chat extends nedb{
	constructor(){
		super("./database/");
		this.from=new NoSql.CharField({length:20});
		this.to=new NoSql.CharField({length:20});
		this.time=new NoSql.CharField({length:30});
	}
	async save(data){
		data.time=String(Date.now());
		return super.save(data);
	}
}
DB.Chat=new Chat();



async function tst(){
	/*await DB.User.edit("VQuxsLv9HBV9LtwV",{isfucker:"yessss!"});
	let res=await DB.User.get({_id:"VQuxsLv9HBV9LtwV"});
	console.log(res);*/;
	let res={};
	for(let i in DB){
		console.log(i)
		for(let j in DB[i]){
			console.log("\t"+j+"  "+DB[i][j].constructor.name);
		}
	}
}
//tst();
export default DB;


