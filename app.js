if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session")
const MongoStore=require('connect-mongo');
const dbUrl=process.env.ATLASDB_URL;
const flash=require("connect-flash")
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user")
const bcrypt = require("bcrypt");
const userRouter=require("./routes/user.js");

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("error in mongo session store",err);
})
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        console.log("Entered Password:", password);
        console.log("Stored Password:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Match:", isMatch);

        if (!isMatch) {
            return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// session setup
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

async function main() {
    await mongoose.connect(dbUrl);
};

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    next();
})

// app.get("/demouser",async (req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
// let registeredUser= await User.register(fakeUser,"helloWorld");
// res.send(registeredUser);
// })
app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went wrong!" } = err;
//     res.status(statusCode).render("error.ejs", { message });
// });

app.listen(8080, () => {
    console.log("server is listening");
})