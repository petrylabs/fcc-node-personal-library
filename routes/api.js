/*
*
*
*       Complete the API routing below
*       
*       
*/
const mongoose = require('mongoose');
const Book = require('../models/book.model');
const Comment = require('../models/comment.model')
const async = require('async');

'use strict';


module.exports = function (app) {

  const SUCCESS_CODE = 200;
  const FAIL_CODE = 200;

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      async.waterfall([
        function (callback) {
          Book.find().select('_id title').exec((err, results) => {
            callback(null, results);
          })
        },
        function (books, callback) {
          Comment.find({book: books.map(book => book.id)}).select('_id content book').exec((err, comments) => {
            callback(null,{books, comments});
          })
        }
      ], function (err, results) {
        if(err) {
          res.status(200).json( { 'error' : err.message } );
          return;
        }
          const resObj = results.books.map(book => {
            const comments = results.comments.filter(comment => comment.book.equals(book._id)).map(comment => comment.content);
            return {
              _id: book._id,
              title: book.title,
              commentcount: comments.length,
              comments: comments
            }
          });
          res.status(200).json(resObj);
      })
      
    })
    
    // You can send a POST request to /api/books with title as part of the form data to add a book. 
    // The returned response will be an object with the title and a unique _id as keys. 
    // If title is not included in the request, the returned response should be the string missing required field title.
    .post(function (req, res) {
      let title = req.body.title;
      if(!title) {
        res.status(200).send('missing required field title');
        return;
      }      
      const new_book = new Book({
        title: title
      })
      new_book.save()
        .then(doc => {
          res.status(200)
          .json({
              _id: doc._id,
              title: doc.title
          })
        })
       .catch(err => {
          res.status(200)
            .json({
              result: 'FAIL',
              message: err.message
          })
       })
    })
    
    .delete(function(req, res){
      //if successful response will be 'delete successful'

      async.parallel({
        book(callback) {
          Book
          .deleteMany()
          .exec(callback)
        },
        comments(callback) {
          Comment
            .deleteMany()
            .exec(callback)
        }
      }, (err, results) => {
          if(err) {
            res.status(FAIL_CODE).json(err);
          }
          res.status(SUCCESS_CODE).send(results.book.deletedCount >= 1
             ? 'complete delete successful'
             : 'no books exist'
          );
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      async.parallel({
        book(callback) {
          Book.findById(bookid).select('_id title').exec(callback);
        },
        comments(callback) {
          Comment.find({bookid: bookid}).select('content').exec(callback);
        }
      }, (err, results) => {
        if(err || results.book == null) {
          const resWithCode = res.status(200);
          return results.book == null || (err.name == 'CastError' 
            && err.path == '_id')
            ? resWithCode.send('no book exists')
            : resWithCode.json({...err})
        }
        const comments = results.comments.map(comment => comment.content)
        res.status(200).json({
          _id: results.book._id,
          title: results.book.title,
          comments: comments,
          commentcount: comments.length
        });
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      
      if(!comment)
        return res.status(200).send('missing required field comment');

      async.waterfall([
        function book_find(callback) {
          Book
            .findById(bookid)
            .exec(callback)
        },
        function comment_create(book, callback) {
          if(!book)
            return callback(null, null)
          new Comment({
            content: comment,
            book: book._id
          })
          .save()
          .then(comment => 
            callback(null, book))
          .catch(err => 
            callback(err)
          )
        },
        function comments_view(book, callback) {
          if(!book)
            return callback(null, null);
          Comment
            .find({bookid: book._id})
            .select('_id, content')
            .exec()
            .then(comments => {
              callback(null, {book, comments})
            })
            .catch(err => {
              callback(err);
            })
        }
      ], function(err, results) {
        if(err) {
          return res.status(FAIL_CODE).json(err);
        }
        if(results == null) {
          return res.status(SUCCESS_CODE).send('no book exists');
        }
        const comments = results.comments.map(comment => comment.content)
        const {_id, title} = results.book;
        res.status(200).json({
          _id: _id,
          title: title,
          commentcount: comments.length,
          comments: comments
        })
      })
    })
             
    
    .delete(function(req, res){
      let bookid = req.params.id;

      async.parallel({
        book(callback) {
          Book
          .deleteOne({id: bookid})
          .exec(callback)
        },
        comments(callback) {
          Comment
            .deleteMany({book: bookid})
            .exec(callback)
        }
      }, (err, result) => {
          if(err) {
            return res.status(FAIL_CODE).json(err);
          }
          res.status(SUCCESS_CODE).send(result.book.deletedCount >= 1
            ? 'delete successful'
            : 'no book exists'
          );
      })
    });
  
};
