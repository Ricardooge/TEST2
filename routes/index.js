var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var message = "";
var getRandomSalt = function(){
    return Math.random().toString().slice(0, 5);
}

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index', {message:message});
});


router.post('/login', function(req, res, next) {
    console.log("req.body"+req.body);
    var username = req.body.username;
    var password = req.body.password;
    if(username && password){
      req.getConnection(function (err, conn) {
          if (err) {
              console.error('SQL Connection error: ', err);
              return next(err);
          } else{
              conn.query('SELECT salt FROM ilance_users WHERE username = ? ', [username], function(error, results){
                  if (results.length > 0) {
                      var salt = results[0].salt;
                      console.log(salt);
                      var md5Password = crypto.createHash('md5').update(password + salt).digest('hex');
                      //console.log(md5Password);
                      conn.query('SELECT * FROM ilance_users WHERE username = ? AND password = ?', [username, md5Password], function(error, result){
                          if(result){
                              req.session.loggedin = true;
                              req.session.username = result[0].username;
                              res.redirect('/dashboard');
                          }
                          else{
                              res.render('index', {message:"Incorrect Username/Password"});
                          }
                      });


                  } else {
                      res.render('index', {message:"Incorrect Username/Password"});
                  }
              });
          }


      });
    } else{
        res.send({status:"failure", message:"false"});
    }

});



router.get('/signup', function (req, res) {
    res.render('signup',{message:message});
});

router.post('/signup', function (req, res) {
    var username = req.body.username;
    console.log(username);
    var password = req.body.password;
    if (username && password){

      var salt = getRandomSalt();
      var md5Password = crypto.createHash('md5').update(password + salt).digest('hex');
      req.getConnection(function (err, conn) {
        conn.query('SELECT * FROM ilance_users WHERE username = "'+ username +'"', function(errs, results){
          console.log(results);
          if(results.length == 0){
            console.log(errs);
            conn.query('INSERT IGNORE INTO ilance_users (username, password, salt) VALUES (?, ?, ?)', [username, md5Password, salt], function (error, result) {
                if (error) {
                    console.log(error);
                    //message = "Username exist"
                    //res.render('signup', {message: "Username exist"});
                }
                if (result) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/dashboard');
                }
            });
          }
          else{
            console.log(results);
            res.render('signup', {message: "Username exist"});
          }
        });

        
      });
    }
    else{
        res.render('signup', {message:"Incorrect fomular"});
    }
});



// router.get('/list', function(req, res, next){
//   try{
//     var limit = 2;
//     var page = req.param('page');
//     var skip = page * limit - page;
//     var orderBy= req.param('orderBy');
//     var sortBy = req.param('sortBy');
//     var query = '';
//     if(orderBy){
//       query = 'select p.project_title, u.username from ilance_projects p INNER JOIN ilance_users u ON u.user_id = p.user_id order by '+orderBy+' '+sortBy+' limit ' + limit + ' offset ' + skip;
//     }
//     else{
//       query = 'select p.project_title, u.username from ilance_projects p INNER JOIN ilance_users u ON u.user_id = p.user_id limit ' + limit + ' offset ' + skip;
//     }
//
//   } catch(ex){
//
//   }
// });
module.exports = router;
