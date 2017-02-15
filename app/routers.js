var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
//var _path_ = '/Users/jlroo/clothesdb';
// load up the user model
//var User = require(_path_+'/app/models/user');
//var Feed = require(_path_+'/app/models/feed');
//var Usage = require(_path_+'/app/models/feed');
var User = require('./../app/models/user');
var Feed = require('./../app/models/feed');
var Usage = require('./../app/models/feed');

module.exports = function(app, router, passport) {

/// ============================================================================
// API ROUTES  =================================================================
// =============================================================================

    // route to authenticate a user (POST http://localhost:8080/api/auth)
    router.post('/auth', function(req, res) {
      var userkey = req.params.apikey || req.query.apikey || req.headers['x-access-apikey'];
      // find the user
      User.findOne({"local.apikey": userkey }, function(err, user) {
        if (err) throw err;
        if (!user) {
          res.json({ success: false, message: 'Authentication failed.' });
        } else if (user) {
          // check if apikey matches
          if (user.local.apikey != userkey) {
            res.json({ success: false, message: 'Authentication failed.' });
          } else {
            // if API key is found create a token
            var token = jwt.sign(user,'somethinginteresante', {
              expiresIn: '24h' // expires in 24 hours
            });
            // return the information including token as JSON
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token
            });
          }
        }
      });
    });

    router.use(function(req, res, next) {
      // check header or url parameters or post parameters for token
      var token = req.params.token || req.query.token || req.headers['x-access-token'];
      // decode token
      if (token) {
        // verifies secret and checks exp
        jwt.verify(token,'somethinginteresante', function(err, decoded) {
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            next();
          }
        });
      } else {
        // if there is no token return an error
        return res.status(403).send({
            success: false,
            message: 'Failed to authenticate token.'
        });
      }
    });

    router.get('/', function(req, res) {
        res.json({ message: 'Hola Bonjour API V.0.5' });
    });

    router.post('/users',function(req, res){
              var newUser = new User();                   // create a new instance of the user model
              newUser.local.username = req.body.username; // set the user parameters
              newUser.local.email = req.body.email;
              newUser.local.password = newUser.generateHash(req.body.password);
              newUser.local.username = req.body.username;
              newUser.local.apikey = newUser.generateKey();
              newUser.save(function(err) {
                  if (err)
                      res.send(err);
                  res.json({ message: 'User created!' });
              });
          });

    // get all the users (accessed at GET http://localhost:8080/api/users)
    router.get('/users',function(req, res) {
        User.find(function(err, users) {
            if (err)
                res.send(err);
            res.json(users);
        });
      });

    // get the user with that user id
    // accessed at GET http://localhost:8080/api/users/:user_id)
    router.get('/users/:user_id',function(req, res) {
          User.findById(req.params.user_id, function(err, user) {
              if (err)
                  res.send(err);
              res.json(user);
          });
      });

      // update the user with id
      // accessed at PUT http://localhost:8080/api/users/:user_id)
      router.put('/users/:user_id',function(req, res) {
          // find user following user model
          User.findById(req.params.user_id, function(err, user) {
              if (err)
                  res.send(err);
              user.local.username = req.body.username;
              user.local.email = req.body.email;
              user.local.brand = req.body.brand;
              user.local.location = req.body.location;
              user.local.color = req.body.color;
              user.local.artist = req.body.artist;
              user.local.media = req.body.media;
              user.save(function(err) {
                  if (err)
                      res.send(err);
                  res.json({ message: 'User updated!' });
              });
          });
      });

      router.delete('/users/:user_id',function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);
            res.json({ message: 'Successfully deleted user!' });
        });
      });

/// ============================================================================
// VIEW ROUTES  =================================================================
// =============================================================================

        // show the home page / login page
        app.get('/', function(req, res) {
            res.render('index.ejs');
        });

        // PROFILE SECTION =========================
        app.get('/profile', isLoggedIn, function(req, res) {
            res.render('profile.ejs', {
                user : req.user
            });
        });

        // HOME SECTION =========================
        app.get('/home', isLoggedIn, function(req, res) {
            res.render('home.ejs', {
                user : req.user
            });
        });

        // TRANSACTIONS =================================

        app.post('/addThing', isLoggedIn, function(req, res){
                  var newThing = new Feed();
                  newThing.state = req.body.state;
                  newThing.name = req.body.name;
                  newThing.url = req.body.url;
                  newThing.brand = req.body.brand;
                  newThing.category = req.body.category;
                  newThing.createdDate = req.body.date;
                  newThing.save(function(err) {
                      if (err)
                          res.send(err);
                      res.render('home.ejs', { message: req.flash('loginMessage') });
                  })
              });

        app.post('/addUsage', isLoggedIn, function(req, res){
                  var newUsage = new Usage();
                  newUsage.name = req.body.name;
                  newUsage.time = req.body.time;
                  newUsage.reaction = req.body.reaction;
                  newUsage.activity = req.body.activity;
                  newUsage.createdDate = req.body.date;
                  newUsage.save(function(err) {
                      if (err)
                          res.send(err);
                      res.render('home.ejs', { message: req.flash('loginMessage') });
                  })
              });

        // update the user with id
        app.post('/addInfo',isLoggedIn,function(req, res) {
            User.findById(req.user, function(err, user) {
                if (err)
                    res.send(err);
                user.local.brand = req.body.brand;
                user.local.location = req.body.location;
                user.local.color = req.body.color;
                user.local.artist = req.body.artist;
                user.local.media = req.body.media;
                user.save(function(err) {
                    if (err)
                        res.send(err);
                    res.render('home.ejs', { message: req.flash('loginMessage') });
                });
            });
        });

        // LOGOUT ==============================
        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally ----------------------------------------------------------------
        // LOGIN ==============================================================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/home', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =============================================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};
