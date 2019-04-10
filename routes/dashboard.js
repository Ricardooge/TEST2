var express = require('express');

var router = express.Router();

/* GET project listing. */
router.get('/', function(req, res) {
    if(req.session.username == null){
        res.redirect('/');
        return;
    }
    res.render('dashboard');
});

router.get('/logout', function(req, res){
    req.session.destroy(function (err) {
        res.redirect('/');
    })
})

router.get('/data', function (req, res) {
    var sortByOption = req.param('sortBy');
    console.log(sortByOption);
    var query = '';
    var sortBy= '';
    switch(sortByOption){
        case 'recentProject' : sortBy = 'p.date_added';
            break;
        case 'usernameAsc' : sortBy = 'u.username';
            break;
        case 'ptitleAsc' : sortBy = 'p.project_title';
            break;
        case 'cnameAsc' : sortBy ='c.categoryname';
            break;



    }
    // query ='select p.project_title, u.username from ilance_projects p INNER JOIN ilance_users u ON u.user_id = p.user_id order by ' + sortBy;
    query ='select p.project_title, u.username, c.categoryname from ilance_users u INNER JOIN ilance_projects p ON u.user_id = p.user_id LEFT JOIN ilance_category c ON p.cid = c.cid order by '+ sortBy;
    req.getConnection(function (err, conn) {
        if (err) {
            console.error('SQL Connection error: ', err);
        }
        else{
            conn.query(query, function(err, rows, fields) {
                if (err) {
                    console.error('SQL error: ', err);
                }

                if (rows || fields) {
                   // console.log(rows);
                    res.json(rows);
                } else {
                    res.json({ "data": "not found" });
                }

            });
        }
    })
    
    
});

module.exports = router;