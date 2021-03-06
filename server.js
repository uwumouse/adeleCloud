if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
// dependencies
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')


// middlewares
const savingsRouter = require('./routes/savings');
const authRouter = require('./routes/auth')
const profilesRouter = require('./routes/profile')
const apiRouter = require('./routes/api')

// app setup
// puclic setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view options', { basedir: __dirname})
app.locals.basedir = path.join(__dirname, 'views')
app.use(express.static(path.join(__dirname + '/public')))

// data usage setup
app.use(bodyParser.json({limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))
app.use(cookieParser(process.env.COOKIE_SECRET))


// mongoose 
mongoose.connect(process.env.DB_URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
const db = mongoose.connection
db.on('error', e => console.error(e))
db.once('connected', () => console.log('MongoDB connected to the server...'))

// using routes
app.get('/', (req, res) => {
    res.redirect('/savings')
})
app.use('/search/', apiRouter)
app.use('/auth/', authRouter)
app.use('/profile/', profilesRouter)
app.use('/savings/', savingsRouter);
app.use(function (req, res, next) {
    res.status(404)
  })


app.listen(process.env.PORT || 8080, console.log(`Server started on port: ${process.env.PORT || 8080}`))