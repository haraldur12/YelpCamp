var express =       require("express"),
    app     =       express(),
    bodyParser =    require("body-parser"),
    mongoose =      require('mongoose'),
    Campground =    require("./models/campgrounds"),
    Comment =       require("./models/comments"),
    SeedDB =        require("./seeds");
SeedDB();
mongoose.connect('mongodb://localhost/yelp_campv4');   

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine','ejs');
// Schema for the campgrounds


app.get('/', (req,res) => {
    res.render('landing');
});

app.get('/campgrounds',(req,res) => {
    Campground.find({},(err,allcampGrounds) => {
        if(err){
            console.log(err);
        }else {
            res.render('campgrounds/index', {campgrounds:allcampGrounds})
        }
    });

    
});
app.get('/campgrounds/new', (req,res) => {
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

app.get("/campgrounds/:id/comments/new", function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: foundCampground});
        }
    })
});
app.post("/campgrounds/:id/comments", function(req, res){
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

app.listen(process.env.PORT, process.env.IP, () => {
    console.log('App has started');
});