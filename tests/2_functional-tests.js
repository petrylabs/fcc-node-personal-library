/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const testItems = []

suite('Functional Tests', function() {


  suiteSetup(async function () {
    const result = await chai.request(server)
      .post('/api/books')
      .send({
        'title': 'My Test Book'
      })
    if (result && result.body) 
      testItems.push(result.body._id);
  })

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            'title' : 'Faux Book 123'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'title');
            assert.equal(res.body.title, 'Faux Book 123');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });      
    });
    suite('GET /api/books/[id] => book object with [id]', function(){

      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/5f665eb46e296f6b9b6a504d')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        })
      });  
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/' + testItems.at(0))
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body._id, testItems.at(0));
          done();
        })
      });
    });
  });
  suite('POST /api/books/[id] => add comment/expect book object with id', function() {
    test('Test POST /api/books/[id] with comment', function(done){
      chai.request(server)
      .post('/api/books/' + testItems.at(0))
      .send({
        comment: 'foobar'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'title');
        assert.property(res.body, '_id');
        assert.property(res.body, 'comments');
        assert.isAtLeast(res.body.commentcount, 1);
        assert.deepInclude(res.body.comments, 'foobar');
        done();
      })
    });
    test('Test POST /api/books/[id] without comment field', function(done){
      chai.request(server)
      .post('/api/books/' + testItems.at(0))
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field comment');
        done();
      })
    });
    test('Test POST /api/books/[id] with comment, id not in db', function(done){
      chai.request(server)
      .post('/api/books/5f665eb46e296f6b9b6a504d')
      .send({
        comment: 'foobar'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      })
    });
  

    suite('DELETE /api/books/[id] => delete book object id', function() {
      // You can send a DELETE request to /api/books/{_id} to delete a book from the collection. The returned response will be the string delete successful if successful. If no book is found, return the string no book exists.
      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .delete('/api/books/' + testItems.at(0))
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          })
      });
      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .delete('/api/books/5f665eb46e296f6b9b6a504d')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          })
      });
    });

  });