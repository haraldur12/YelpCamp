## Updates

1. Authentication added
2. Users are only able to certain parts if they are not logged in.
3. Cleaned up the style for register and login

In this version file structure is yet to be established. The routes still remain
inside the app.js. 

For authentication [PassportJS](http://passportjs.org/docs) was used. 

```javascript
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};
```