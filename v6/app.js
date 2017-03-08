var express =       require("express"),
    app     =       express(),
    bodyParser =    require("body-parser"),
    mongoose =      require('mongoose'),
    Campground =    require("./models/campgrounds"),
    Comment =       require("./models/comments"),
    passport =      require('passport'),
    LocalStrategy =  require("passport-local"),
    User =          require('./models/users'),
    SeedDB =        require("./seeds");
SeedDB();

app.use(require("express-session")({
    secret : 'things we have to keep as secrets',
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=> {
    res.locals.currentUser = req.user;
    next();
});
mongoose.connect('mongodb://localhost/yelp_campv6');   

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));

// Schema for the campgrounds


app.get('/', (req,res) => {
    res.render('landing');
});

app.get('/campgrounds',(req,res) => {
    console.log(req.user);
    Campground.find({},(err,allcampGrounds) => {
        if(err){
            console.log(err);
        }else {
            res.render('campgrounds/index', {campgrounds:allcampGrounds});
        }
    });

    
});
app.get('/campgrounds/new',isLoggedIn, (req,res) => {
    res.render('campgrounds/new');
});

app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
})

app.post("/campgrounds", function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

// Comments routes 

app.get("/campgrounds/:id/comments/new",isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: foundCampground});
        }
    })
});
app.post("/campgrounds/:id/comments",isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});
// Authentication routes
app.get('/register',(req,res) => {
    res.render('register');
});

app.post('/register', (req,res) => {
    var newUser = new User({username : req.body.username});
    User.register(newUser,req.body.password, function(err,user){
        if(err){
            return res.render('register');
        }
        passport.authenticate('local')(req,res, () => {
            res.redirect('/campgrounds');
        });
    });
});

app.get('/login', (req,res)=> {
    res.render('login');
});
app.post('/login',passport.authenticate('local',{
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}),(req,res)=>{
    
});

app.get('/logout', (req,res) => {
   req.logout();
   res.redirect('/campgrounds')
});
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

app.listen(process.env.PORT, process.env.IP, () => {
    console.log('App has started');
});