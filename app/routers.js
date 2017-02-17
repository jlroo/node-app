var jwt = require('jsonwebtoken');          // create, sign, and verify tokens
var validator = require('validator');
var async = require('async');
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
        res.json({ message: 'Hola Bonjour API V.1.0' });
    });

    // route to new user
    // POST http://localhost:8080/api/v1/users/new?username&email&password&token=xxxxxxxxxx
    router.post('/users/new',function(req, res){
      var username = req.params.username || req.query.username || req.headers['x-access-username'];
      var email = req.params.email || req.query.email || req.headers['x-access-email'];
      var password = req.params.password || req.query.password || req.headers['x-access-password'];
      if (undefined == username) {
          errStr = "Undefined UserName";
          res.status(400);
          res.json({error: errStr});
          return;
      } else if (undefined == email) {
          errStr = "Undefined Email";
          res.status(400);
          res.json({error: errStr});
          return;
      } else if (undefined == password) {
          errStr = "Undefined Password";
          res.status(400);
          res.json({error: errStr});
          return;
      }
      if (!validator.isEmail(email)) {
          res.status(400);
          res.json({error: 'Invalid email format'})
          return;
      }
      User.findOne({'local.email' : email}, function (err, result) {
          if (result == {}) {
              res.status(400);
              res.json({error: 'Account with that email already exists.  Please choose another email.'});
              return;
          } else {
            var newUser = new User();
            newUser.local.username = req.params.username;
            newUser.local.email = req.params.email;
            newUser.local.password = newUser.generateHash(req.params.password);
            newUser.local.apikey = newUser.generateKey();
            newUser.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'User created!' });
            });
          }
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


    router.put('/users/:user_id', function(req, res) {
        var errStr = null;
        var resultStatus = null;
        var resultJSON = {user:null};
        if (err) {
            errStr = "Error on user profile";
            res.status(400);
            res.json({error: errStr,"err":err});
            return;
        }
        var Tasks = [
            function findUser(cb) {
                User.findById(req.user_id, function(err, user) {
                  if (err) {
                      errStr = 'Internal error with mongoose looking user ' + req.user_id;
                      resultStatus = 400;
                      resultJSON = { error : errStr };
                      cb(new Error(errStr));
                      return;
                  }
                  if (user.length == 0) {
                      errStr = 'User ID: ' + req.user_id + ' didnt find any objects';
                      resultStatus = 400;
                      resultJSON = { error : errStr };
                      cb(new Error(errStr));
                      return;
                  }
                  cb(null);
                });
            },
            function addInfo(cb) {
              user.local.brand = req.parms.brand;
              user.local.location = req.parms.location;
              user.local.color = req.parms.color;
              user.local.artist = req.parms.artist;
              user.local.media = req.parms.media;
              user.save(function(err) {
                if (err) {
                    errStr = 'Error adding new data';
                    resultStatus = 400;
                    resultJSON = { error : errStr };
                    cb(new Error(errStr));
                    return;
                } else {
                  resultJSON = { "OK" : "200" };
                  res.render('home.ejs', { message: req.flash('loginMessage') });
                    cb(null);
                }
              });
            }
        ]

        async.series(Tasks, function finalizer(err, results) {
            if (null==resultStatus) {
                res.status(200);
            } else {
                res.status(resultStatus);
            }
            res.json(resultJSON);
        });
    });

      // update the user with id
      // accessed at PUT http://localhost:8080/api/users/:user_id)
      router.put('/users/:user_id',function(req, res) {
        errStr = undefined;
        if (undefined == req.params.user_id) {
            errStr = "Undefined user ID";
            res.status(400);
            res.json({error: errStr});
            return;
        }
        // find user following user model
        User.findById(req.params.user_id, function(err, user) {
              if (err){
                  res.status(400);
                  res.send(err);
              }
              var username = req.params.username || req.query.username || req.headers['x-access-username'];
              var brand = req.params.brand || req.query.brand || req.headers['x-access-brand'];
              var artist = req.params.artist || req.query.artist || req.headers['x-access-artist'];
              var color = req.params.color || req.query.color || req.headers['x-access-color'];
              var location = req.params.location || req.query.location || req.headers['x-access-location'];

              if (undefined == username) {
                  errStr = "Undefined UserName";
                  res.status(400);
                  res.json({error: errStr});
                  return;
              } else if (undefined == brand) {
                  errStr = "Undefined Password";
                  res.status(400);
                  res.json({error: errStr});
                  return;
              } else if (undefined == color) {
                    errStr = "Undefined color";
                    res.status(400);
                    res.json({error: errStr});
                    return;
              } else if (undefined == location) {
                    errStr = "Undefined location";
                    res.status(400);
                    res.json({error: errStr});
                    return;
              } else if (undefined == artist) {
                  errStr = "Undefined artist";
                  res.status(400);
                  res.json({error: errStr});
                  return;
              }
              } if (undefined == media) {
                  errStr = "Undefined media";
                  res.status(400);
                  res.json({error: errStr});
                  return;
              }
              user.local.username = username;
              user.local.brand = brand;
              user.local.location = location;
              user.local.color = color;
              user.local.artist = artist;
              user.local.media = media;
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
          var errStr = undefined
          if (undefined == req.body.state) {
              errStr = "Undefined State";
              res.status(400);
              res.json({error: errStr});
              return;
          } else if (undefined == req.body.name) {
              errStr = "Undefined Name";
              res.status(400);
              res.json({error: errStr});
              return;
          } else if (undefined == req.body.url) {
              errStr = "Undefined Url";
              res.status(400);
              res.json({error: errStr});
              return;
          } else if (undefined == req.body.brand) {
              errStr = "Undefined Brand";
              res.status(400);
              res.json({error: errStr});
              return;
          } else if (undefined == req.body.category) {
              errStr = "Undefined Category";
              res.status(400);
              res.json({error: errStr});
              return;
          }
          if (undefined == req.body.date) {
              errStr = "Undefined Date";
              res.status(400);
              res.json({error: errStr});
              return;
          }
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
        var errStr = undefined
        if (undefined == req.body.name) {
            errStr = "Undefined Name";
            res.status(400);
            res.json({error: errStr});
            return;
        } else if (undefined == req.body.time) {
            errStr = "Undefined Time";
            res.status(400);
            res.json({error: errStr});
            return;
        } else if (undefined == req.body.reaction) {
            errStr = "Undefined reaction";
            res.status(400);
            res.json({error: errStr});
            return;
        } else if (undefined == req.body.activity) {
            errStr = "Undefined activity";
            res.status(400);
            res.json({error: errStr});
            return;
        }
        if (undefined == req.body.date) {
            errStr = "Undefined Date";
            res.status(400);
            res.json({error: errStr});
            return;
        }
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

      // update the user profile add more information
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
            successRedirect : '/home',  // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page
            failureFlash : true         // allow flash messages
        }));

        // SIGNUP =============================================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup',  // redirect back to the signup page
            failureFlash : true           // allow flash messages
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
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};
