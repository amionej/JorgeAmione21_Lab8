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

// var today = new Date();

// let blogposts = [
//     {
//         id: 1,
//         title: 'hello',
//         content: '1x1=1',
//         author: 'Jorge',
//         publishDate: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
//     },
//     {
//         id: 2,
//         title: 'goodbye',
//         content: '2x2=4',
//         author: 'Maria',
//         publishDate: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
//     },
//     {
//         id: 3,
//         title: 'hasta pronto',
//         content: '3x3=9',
//         author: 'Jose',
//         publishDate: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
//     },
// ];

// ID IN BODY BEING NUMBER TYPE MAY CAUSE PROBLEMS WHEN REQUESTING IN POSTMAN

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
    // let authorBlogPosts = [];
    // for (let i = 0; i< blogposts.length; i++){
    //     if (blogposts[i].author === req.params.author){
    //         authorBlogPosts.push(blogposts[i]);
    //     }
    // }
    // if (authorBlogPosts.length > 0){
    //     return res.status(200).json( authorBlogPosts );
    // }
    // return res.status(400).json({
    //     code: 404,
    //     message : "Author not found",
    // })
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
        let temp = {
            id: uuid.v4(),
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            publishDate: req.body.publishDate,
        };
        
        BlogPosts.post(temp)//it is a promise, so there goes a .then()
            .then(newPost => {
                return res.status(201).json(newPost);
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
            return post.status(201).json(post);
        })
        .catch(err => {
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
                let tempPost = json(post);
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
                BlogPosts.put(id, tempPost)
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
    // for (let i = 0; i< blogposts.length; i++){
    //     if (String(blogposts[i].id) === req.params.id){
    //         if(req.body.title) {
    //             blogposts[i].title=req.body.title;
    //         } 
    //         if(req.body.content) {
    //             blogposts[i].content=req.body.content;
    //         }
    //         if(req.body.author) {
    //             blogposts[i].author=req.body.author;
    //         }
    //         if(req.body.publishDate) {
    //             blogposts[i].publishDate=req.body.publishDate;
    //         }
    //         postUpdated=blogposts[i]
    //         return res.status(202).json({
    //             success: 'true',
    //             message: 'Post updated successfully',
    //             postUpdated
    //           })
    //     }
    // }
    // return res.status(404).json({
    //     code: 404,
    //     message : `Post with id ${req.body.id} does not exist`,
    // })
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