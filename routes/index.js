const express = require('express');
const router = express.Router();
const md5 = require('blueimp-md5')

const {UserModel} = require('../db/models')

const filter = {password: 0, __v: 0}   //定义过滤器

/* GET home page. */
// router.post('/', function(req, res) {
//   let {username, password} = req.body
//   if( username === 'admin'){
//     res.send({code: 1, msg: '此用户已经存在'})
//   } else {
//     res.send({code: 0, data: {id: 'abc123', username, password}})
//     res.end('成功')
//   }
// });
//注册路由
router.post('/register', (req, res) => {
  const {username, password, type} = req.body
  UserModel.findOne({username}, (err, doc) => {
    if(doc){
      res.send({code: 1, msg: '用户名已经存在', data: ''})
    } else {
      try {
        new UserModel({username, type, password: md5(password)}).save((err, doc) => {
          res.cookie('userid', doc._id, {maxAge: 1000 * 60 * 60 * 24})  //保存24小时
          const data = {username, type, _id: doc._id}
          res.send({code: 0, msg: '注册成功', data})
        })
      }catch (e) {
        console.log(e)
      }
    }
  })
})

//登录路由
router.post('/login', (req, res) => {
  const {username, password} = req.body
  UserModel.findOne({username, password: md5(password)}, filter, (err, doc) => {
    if(doc){    //findOne第二个参数有filter
      res.cookie('userid', doc._id, {maxAge: 1000*60*60*24})  //保存24小时
      res.send({code: 0, msg: '登陆成功', data: doc})
    } else {
      res.send({code: 1, msg: '用户名或密码不正确'})
    }
  })
})

//更新路由
router.post('/update', (req, res) => {
  const userid = req.cookies.userid
  if(!userid){
    return res.send({code: 1, msg: '对不起，你还没有登陆'})
  }
  const user = req.body
  UserModel.findOneAndUpdate({_id: userid}, user, (err, oldUser) => {
    if(!oldUser){
      res.clearCookie('userid')      //express删除cookie方法clearCookie
      res.send({code: 1, msg: '对不起，你还没有登陆'})
    } else {
      const {_id, username, type} = oldUser
      const data = Object.assign(user, {_id, username, type})
      res.send({code: 0, msg: '修改成功', data})
    }
  })
})

router.get('/user', (req, res) => {
  const userid = req.cookies.userid
  if(!userid){
    return res.send({code: 1, msg: '请先登录'})
  }
  UserModel.findOne({_id: userid}, filter, (err, doc) => {
    res.send({code: 0, data: doc})
  })
})

router.get('/userlist', (req, res) => {
  const {type} = req.query
  UserModel.find({type}, (err, doc) => {
    res.send({code: 0, data: doc})
  })
})

/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', function (req, res) {
  // 获取cookie中的userid
  const userid = req.cookies.userid
  // 查询得到所有user文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
    /*const users = {} // 对象容器
    userDocs.forEach(doc => {
      users[doc._id] = {username: doc.username, header: doc.header}
    })*/

    const users = userDocs.reduce((users, user) => {
      users[user._id] = {username: user.username, header: user.header}
      return users
    } , {})
    /*
    查询userid相关的所有聊天信息
     参数1: 查询条件
     参数2: 过滤条件
     参数3: 回调函数
    */
    ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users, chatMsgs}})
    })
  })
})

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
  // 得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userid
  /*
  更新数据库中的chat数据
  参数1: 查询条件
  参数2: 更新为指定的数据对象
  参数3: 是否1次更新多条, 默认只更新一条
  参数4: 更新完成的回调函数
   */
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    console.log('/readmsg', doc)
    res.send({code: 0, data: doc.nModified}) // 更新的数量
  })
})

module.exports = router;
