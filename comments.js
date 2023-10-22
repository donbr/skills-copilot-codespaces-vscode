// Create web server
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var commentsPath = path.join(__dirname, 'comments.json');

// Create a middleware that will print the request
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

// Create a middleware that will add the current time to the request
router.use(function(req, res, next) {
    req.requestTime = Date.now();
    next();
});

// Create a middleware that will log the request time
router.use(function(req, res, next) {
    var time = Date.now() - req.requestTime;
    console.log('Request time:', time + 'ms');
    next();
});

// Create a middleware that will read the comments file
router.use(function(req, res, next) {
    fs.readFile(commentsPath, function(err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            req.comments = JSON.parse(data);
            next();
        }
    });
});

// Create a middleware that will write the comments file
router.use(function(req, res, next) {
    fs.writeFile(commentsPath, JSON.stringify(req.comments, null, 4), function(err) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            next();
        }
    });
});

// Get all comments
router.get('/', function(req, res) {
    res.json(req.comments);
});

// Get a comment by id
router.get('/:id', function(req, res) {
    var id = parseInt(req.params.id);
    var comment = req.comments.find(function(comment) {
        return comment.id === id;
    });
    if (comment) {
        res.json(comment);
    } else {
        res.sendStatus(404);
    }
});

// Create a new comment
router.post('/', function(req, res) {
    var comment = {
        id: req.comments.length + 1,
        title: req.body.title,
        text: req.body.text
    };
    req.comments.push(comment);
});

// Update an existing comment
router.put('/:id', function(req, res) {
    var id = parseInt(req.params.id);
    var comment = req.comments.find(function(comment) {
        return comment.id === id;
    });
    if (comment) {
        comment.title = req.body.title;
        comment.text = req.body.text;
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
});

// Delete a comment
router.delete('/:id', function(req, res) {
    var id = parseInt(req.params.id);
    var commentIndex = req.comments.findIndex(function(comment) {
        return comment.id === id;
    });
    if (commentIndex !== -1) {
        req.comments.splice(commentIndex, 1);
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;