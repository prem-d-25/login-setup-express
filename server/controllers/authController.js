// server/controllers/authController.js
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { genrateAccessToken, genrateRefreshToken } from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  try {
    const { name, email, password, role} = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    // 4. Hash the password — NEVER store plain text
    const salt = await bcrypt.genSalt(10)       // generate random salt
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role=="admin" ? role : 'user'  
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}


export const login = async (req, res)=>{
  try {

    console.log("asdas")
    const {email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({message: 'email and password are require'})
    }

    const user = await User.findOne({email}).select('+password');
    if(!user){
      return res.status(400).json({message: `Invalid credentials`})
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
      return res.status(400).json({message: `Invalid credentials`})
    }

    const accessToken = genrateAccessToken(user._id, user.role)
    const refreshToken = genrateRefreshToken(user._id)
    
    console.log("refreshToken")

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Front js can not access this 
      secure: process.env.NODE_ENV  == 'production', //HTTPS in only production
      sameSite: 'strict', // for CSRF attack 
      maxAge: 7*24*60*60*1000 // 7d in millisecond
    })

    return res.status(200).json({
      accessToken,
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role
      }
    })

  }
  catch(error){
    console.error(error)
    return res.status(500).json({message: `Server Error ${error.message}`})
  }
}


export const refreshAccessToken = async (req, res)=>{
  try{
    const token = req.cookies?.refreshToken
    if(!token){
      return res.status(401).json({message: 'No refresh token'}) 
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

    const user = await User.findById(decoded.id).select("-password")
    if(!user){
      res.status(401).json({message: 'User not found'})
    }

    const accessToken = genrateAccessToken(user._id, user.role)
    res.status(200).json({ accessToken, user})

  }
  catch(error){
    console.error(error)
    return res.status(403).json({message: 'Invalid or expired refresh token'})
  }
}

export const logout = async (req, res)=>{
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: 'strict'
  })

  return res.status(200).json({message: 'Logged out successfully'})
}