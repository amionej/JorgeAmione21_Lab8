let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let blogPostSchema = mongoose.Schema({
    id: {type: String,
        required: true,
    },
    title: {type: String},
    content: {type: String},
    author: {type: String},
    publishDate: {type: Date},
});

let Post = mongoose.model('Post', blogPostSchema);

let BlogPosts = {
    //everything should already be validated by now
    post: function(newPost){
        return Post.create(newPost)
            .then( post => {//once it is finally created
                return post;
            })
            .catch(err => {//if something goes wrong w/ the databae
                throw Error(err);
            });
    },
    getAll: function(){
        return Post.find()
            .then( post => {
                return post;
            })
            .catch(err => {
                throw Error(err);
            })
    },
    getByAuthor: function(author){
        return Post.find({author: author})
            .then( posts => {
                return posts;
            })
            .catch(err => {
                throw Error(err);
            })
    },
    getById: function(id){
        return Post.findOne({id: id})
            .then( post => {
                return post;
            })
            .catch(err => {
                throw Error(err);
            })
    },
    put: function(id, updatedObj){
        return Post.findOneAndUpdate({id: id}, {$set: {"author":updatedObj.author, "content":updatedObj.content, "publishDate":updatedObj.publishDate,"title":updatedObj.title,}}, {new: true})
            .then( post => {
                return post;
            })
            .catch(err => {
                throw Error(err);
            })
    },
    delete: function(id){
        return Post.findOneAndRemove({id: id})
            .then( post => {
                return post;
            })
            .catch(err => {
                throw Error(err);
            })
    },

}

module.exports = { BlogPosts };