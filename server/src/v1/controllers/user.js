const JWT = require('jsonwebtoken')
const CryptoJS = require('crypto-js')
const User = require('../models/user')
const { json } = require('express')
const router = require('../routes/auth')

// ユーザー登録API
exports.register = async (req, res) => {
  // パスワードの受け取り
  const password = req.body.password

  try {
    // パスワードの暗号化
    req.body.password = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY)
    // ユーザーの新規作成
    const user = await User.create(req.body)
    // JWTの発行
    const token = JWT.sign({id: user._id}, process.env.TOKEN_SECRET_KEY, {
      expiresIn: '24h'
    })
    return res.status(200).json({user, token})
  } catch (err) {
    return res.status(500).json(err)
  }
}

//　ログインAPI
exports.login = async (req, res) => {
  const {username, password} = req.body

  try {
    const user = await User.findOne({username})
    if(!user) {
      return res.status(401).json({
        errors: {
          param: 'username',
          mesasge: 'ユーザー名が無効です'
        }
      })
    }

    // パスワードが合っているか
    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_KEY
    ).toString(CryptoJS.enc.Utf8)

    if(password !== decryptedPassword) {
      return res.status(401).json({
        errors: {
          param: 'password',
          mesasge: 'パスワードが無効です'
        }
      })
    }

    // JWTの発行
    const token = JWT.sign({id: user._id}, process.env.TOKEN_SECRET_KEY, {
      expiresIn: '24h'
    })

    return res.status(201).json({user, token})
  }catch (err) {
    return res.status(500).json(err)
  }
}