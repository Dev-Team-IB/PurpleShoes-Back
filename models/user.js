const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const { paymentSchema } = require("../schemas/payment");

const userSchema = mongoose.Schema({
  role: { // 0 - 일반 User, 8 - Tailer 수선업자, 9 - Admin
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, //dhsdb 1541 @naver.com 을 dhsdb1541@naver.com로 trim
    unique: true,
  },
  password: {
    type: String,
    minLength: 5,
  },
  phoneNum: {
    type: String,
    maxLength: 15,
  },
  address: {
    type: String,
    maxLength: 50,
  },
  birthDate: {
    type: Date,
  },
  gender: { // M 남자 , F 여자
    type: String,
  },
  payments: [paymentSchema],
});

//save 메소드가 실행되기전에 비밀번호를 암호화
userSchema.pre("save", function (next) {
  let user = this;

  //model 안의 paswsword가 변환될때만 암호화
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword) {
  //plainPassword를 암호화해서 현재 비밀번호화 비교
  return bcrypt
    .compare(plainPassword, this.password)
    .then((isMatch) => isMatch)
    .catch((err) => err);
};

userSchema.methods.generateToken = function () {
  // let user = this;
  const token = jwt.sign(this._id.toHexString(), "secretToken");
  this.token = token;
  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

userSchema.statics.findByToken = function (token) {
  let user = this;
  // secretToken을 통해 user의 id값을 받아옴
  // 해당 아이디로 DB의 데이터 가져옴
  return jwt.verify(token, "secretToken", function (err, decoded) {
    return user
      .findOne({ _id: decoded })
      .then((user) => user)
      .catch((err) => err);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };