var express = require('express');
var router = express.Router();
const { User } = require("../models/user");


router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  //로그인시 아이디와 비밀번호 json으로 넘겨줌
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.json({
        loginSuccess: false,
        message: "Invalid Email",
      });
    }
    user
      .comparePassword(req.body.password)
      .then((isMatch) => {
        if (!isMatch) {
          return res.json({
            loginSuccess: false,
            message: "Invalid Password",
          });
        }
    //비밀번호 일치했을 때 토큰 생성
        user
          .generateToken() //jwt 토큰 생성
          .then((user) => {
            res
              .cookie("x_auth", user.token)
              .status(200)
              .json({ loginSuccess: true, userId: user._id });
          })
          .catch((err) => {
            res.status(400).send({loginSuccess: false, err});
          });
      })
      .catch((err) => res.json({ loginSuccess: false, err }));

  });
});

router.post('/register', function(req, res, next) {
  //post로 넘어온 데이터를 받아서 DB에 저장
  //user 모델에서 mongoose에 연결 => 바로 데이터베이스에 저장
  const user = new User(req.body);
  // req의 body는 

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

module.exports = router;