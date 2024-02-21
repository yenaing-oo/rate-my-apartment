if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const User = require('./models/user.js');

const ExpressError = require('./utils/ExpressError.js');

const apartmentRoutes = require('./routes/apartments.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');

mongoose.set('strictQuery', false);

const dbUrl = process.env.DB_URL;

main().catch(err => console.log(err));


// check for error when connecting to 
async function main() {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

const app = express('ejs');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dl3fvcqet/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

// on() and once() are methods made available by Node.js, which were also used to check the MongoDB database
// connection. You can read more about them here:
// https://nodejs.org/api/events.html#events_emitter_on_eventname_listener
// Basically, it attaches a listener to a certain event. Once that event occurs,
// in this case, an error, that function passed as the second argument (called listener) is then executed, 
// and that function, in turn, automatically receives the error as the argument.

store.on('error', function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // prevents client-side JavaScript code from accessing the session cookie
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7, // sets a specific expiry time for cookie
        maxAge: 1000*60*60*24*7 // expires after 1 week of inactivity (from last access)
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// tells Passport that we want to use the local authentication strategy provides the function to do that
passport.use(new LocalStrategy(User.authenticate()));

// provides Passport with functions to create and destroy sessions for users
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// needs to be placed before any route handlers
// for every request, before passing on request to a route handler, we check and store any flash
// messages for success in res.locals, so that it is accessible within any template page without the need
// for the success flash message to be passed through when rendering
app.use((req, res, next) => {
    // adding this to 'locals' give us access to the current user (if they are logged in)
    // allowing us to show relevant links in the nav bar (such as login/register or logout)
    // without the need to pass in req.user to every template
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/apartments', apartmentRoutes)
app.use('/apartments/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

// for any type of request with any url
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no! Something went wrong.'
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log('Serving on port 3000')
});