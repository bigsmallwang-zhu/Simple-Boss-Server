const mongoose = require('mongoose')
const md5 = require('blueimp-md5')  //md5加密
let Schema = mongoose.Schema

mongoose.connect('mongodb://localhost:27017/zhipin_test')

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("数据库连接成功");
});

const userSchema =new Schema({            //指定文档结构
  username: {type: String, required: true},
  password: {type: String, required: true},
  type: {type: String, required: true},
  header: {type: String}
});


const UserModel = mongoose.model('user', userSchema)   //创建集合,名称的单数，不加s

function test(){
  // let admin = {
  //   username: 'boss',
  //   password: md5('123'),
  //   type: 'laoban'
  // }
  let boss = {
    username: 'Bob',
    password: md5('123'),
    type: 'laoban'
  }
  let userModel = new UserModel(boss)

  userModel.save((err, data) => {
    console.log(data)
    db.close()
  })

}
test()