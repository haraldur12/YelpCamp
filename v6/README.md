## Updates

1. Authentication added
2. Users are only able to certain parts if they are not logged in.
3. Cleaned up the style for register and login

In this version file structure is yet to be established. The routes still remain
inside the app.js. 

For authentication [PassportJS](http://passportjs.org/docs) was used. 

## Checking whether users have logged in or not 

```javascript
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};
```
## Using the user data as a global object in all ejs templates

```javascript
app.use((req,res,next)=> {
    res.locals.currentUser = req.user;
    next();
});
```
## Requiring isLoggedIn in the routes

```javascript
app.get('/campgrounds/new',isLoggedIn, (req,res) => {
    res.render('campgrounds/new');
});
```