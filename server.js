let express = require('express');
let morgan = require('morgan');
let uuid = require('uuid');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let { BlogPosts } = require('./blog-post-model.js');
let{ DATABASE_URL, PORT } = require('./config');
let letbcrypt= require("bcryptjs");
let app = express();
let bodyParser = require ('body-parser')
let jsonParser = bodyParser.json();

app.use(express.static('public'));
app.use( morgan( 'dev' ));

app.get('/blog-posts', (req, res) => {
    BlogPosts.getAll()
    .then(posts => {
        return res.status(201).json(posts);
    })
    .catch(err => {
        res.statusMessage = "Something went wrong with the DB";
        return res.status(500).json({
            message: "Something went wrong with the DB",
            status: 500
        });
    });
})

app.get('/blog-post/:author', (req, res) => {
    if (req.params.author === undefined){
        return res.status(406).json({
            code: 406,
            message : "Missing author query",
        })
    }
    BlogPosts.getByAuthor(req.params.author)
    .then(posts => {
        return res.status(201).json(posts);
    })
    .catch(err => {
        res.statusMessage = "Something went wrong with the DB";
        return res.status(500).json({
            message: "Something went wrong with the DB",
            status: 500
        });
    });
})

app.post('/blog-post', jsonParser, (req, res) => {

        if(!req.body.title) {
            return res.status(406).send({
              success: 'false',
              message: 'title is required'
            });
          } 
        else if(!req.body.content) {
            return res.status(406).send({
              success: 'false',
              message: 'content is required'
            });
        }
        else if(!req.body.author) {
            return res.status(406).send({
              success: 'false',
              message: 'author is required'
            });
        }
        else if(!req.body.publishDate) {
            return res.status(406).send({
              success: 'false',
              message: 'publishDate is required'
            });
        }
        let newPost = {
            id: uuid.v4(),
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            publishDate: req.body.publishDate,
        };
        console.log(newPost);
        BlogPosts.post(newPost)//it is a promise, so there goes a .then()
            .then(post => {
                return res.status(201).json(post);
            })
            .catch(err => {
                res.statusMessage = "Something went wrong with the DB";
                return res.status(500).json({
                    message: "Something went wrong with the DB",
                    status: 500
                });
            });
    })

app.delete('/blog-posts/:id', (req, res) => {
    BlogPosts.delete(req.params.id)
        .then(post => {
            console.log("SIMON");
            return post.status(201).json(post);
        })
        .catch(err => {
            console.log("Tambien");
            res.statusMessage = "Something went wrong with the DB";
            return res.status(500).json({
                message: "Something went wrong with the DB",
                status: 500
            });
        });
})
app.put('/blog-posts/:id', jsonParser, (req, res) => {
    if(!req.body.id) {
        return res.status(406).send({
            success: 'false',
            message: 'id in body is required'
          });
    }
    else if (req.body.id !== req.params.id){
        return res.status(409).send({
            success: 'false',
            message: 'id in body is not equivalent to id in path'
          });
    }

    BlogPosts.getById(req.body.id)
        .then(post => {
            if (post){
                let tempPost = post;
                console.log(tempPost.title)
                if(req.body.title) {
                    tempPost.title=req.body.title;
                } 
                if(req.body.content) {
                    tempPost.content=req.body.content;
                }
                if(req.body.author) {
                    tempPost.author=req.body.author;
                }
                if(req.body.publishDate) {
                    tempPost.publishDate=req.body.publishDate;
                }
                BlogPosts.put(req.body.id, tempPost)
                    .then(updatedPost => {
                        return res.status(201).json(updatedPost);
                    })
                    .catch(err => {
                        res.statusMessage = "Something went wrong with the DB";
                        return res.status(500).json({
                            message: "Something went wrong with the DB",
                            status: 500
                        });
                    });
            }
            else{
                return res.status(406).json({
                    message: "No post with such ID",
                    status: 406
                });
            }
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB";
            return res.status(500).json({
                message: "Something went wrong with the DB",
                status: 500
            });
        });
})

function runServer(port, databaseUrl){
    return new Promise( (resolve, reject ) => {
        mongoose.connect(databaseUrl, response => {
            if ( response ){
                return reject(response);
            }
            else {
                server = app.listen(port, () => {
                    console.log( "App is running on port " + port );
                    resolve();
                })
                .on( 'error', err => {
                    mongoose.disconnect();
                    return reject(err);
                })
            }
        });
    });
}

function closeServer(){
    return mongoose.disconnect()
    .then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing the server');
            server.close( err => {
                if (err){
                    return reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    });
}
   
runServer( PORT, DATABASE_URL )
    .catch( err => {
        console.log( err );
    });
   
   module.exports = { app, runServer, closeServer };