const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const uniqid = require('uniqid')
const router = Router()

const User = require('../models/UserModel')


// auth page
router.get('/login', async(req, res) => {
    if( req.signedCookies.accessToken ) return res.redirect('/savings')

    res.render('auth/login')
})

router.post('/login', async( req, res) => {
    const { userMail, userPassword } = req.body;

    const  user  = await User.findOne({
        email: userMail,
    })
    if(!user){
        return res.render('auth/login', {
            error: {
                message: 'User e-mail is not corrent.'
            }
        })
    }
    const  { password, profileId, userName}  = user
    let validPass = await bcrypt.compare(userPassword, password)
    if(!validPass){
        return res.render('auth/login', {
            error: {
                message: 'The password is not correct.'
            }
        })
    } 
    const token = jwt.sign(
        {
            email: userMail,
            id: profileId
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: 60 * 30
        }
    )
    const refreshToken = jwt.sign(
        {
            email: userMail,
            id: profileId,
            name: userName

        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: '1h'
        }  
    )
    res.cookie('accessToken', token, { httpOnly: true, signed: true })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, signed: true })
    return res.redirect('/savings')

})

// register page
router.get('/register', async(req, res) => {
    if( req.signedCookies.accessToken ) return res.redirect('/savings')
    res.render('auth/register')
})

router.post('/register', async(req, res) => {
    const { userMail, userPassword, userName } = req.body;
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    let existingUser = await User.findOne({email : userMail});
    if (existingUser){
        return res.render('auth/register', {
            error: {
                message: 'User with this email already exists.'
            }
        })
    }
    let profileId =  uniqid('u_') // uniq profile id

    let newUser = new User({
        profileId, 
        userName,
        email: userMail,
        password: hashedPassword
    })
    
    await newUser.save()

    const token = jwt.sign(
        {
            email: userMail,
            id: profileId
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: 60 * 30
        }
    )
    const refreshToken = jwt.sign(
        {
            email: userMail,
            name: userName,
            id: profileId
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: '1h'
        }  
    )
    res.cookie('accessToken', token, { httpOnly:true, signed:true })
    res.cookie('refreshToken', refreshToken, { httpOnly: true,signed:true })
    return res.redirect('/savings')

})

module.exports = router;