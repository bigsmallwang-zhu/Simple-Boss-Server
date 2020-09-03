const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.connect('mongodb://localhost:27017/zhipin')
mongoose.set('useFindAndModify', false)
const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));
db.on('connected', () => {
  console.log("数据库连接成功");
})

const userSchema =new Schema({            //指定文档结构
  username: {type: String, required: true},
  password: {type: String, required: true},
  type: {type: String, required: true},
  header: {type: String},    //头像
  post: {type: String},     //职位
  info: {type: String},     //个人简介
  company: {type: String},  //公司名称
  salary: {type: String}    //工资
});

const UserModel = mongoose.model('user', userSchema)   //创建集合,名称的单数，不加s
exports.UserModel = UserModel


const chatSchema =new Schema({            //指定文档结构
  from: {type: String, required: true},  //发送方
  to: {type: String, required: true},   //接收方
  chat_id: {type: String, required: true},  //from和to组成的字符串
  content: {type: String, required: true},   //内容
  read: {type: Boolean, default: false},  //标记是否已读
  create_time: {type: Number},   //创建时间
})

const ChatModel = mongoose.model('chat', chatSchema)   //chats

exports.ChatModel = ChatModel