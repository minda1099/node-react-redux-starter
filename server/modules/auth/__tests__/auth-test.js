// TESTS For AUTH APIs
const chai = require('chai');
const chaiHttp = require('chai-http');
process.env.NODE_ENV = 'test';
const server = require('../../../server.js').server;
const should = chai.should();

const { expect } = require('chai');
const auth = require('../index');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const request = require('supertest');
chai.use(chaiHttp);
process.env.NODE_ENV = 'test';


function randomEmail() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 12; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

describe('Authentication Module', () => {
  const testEmail = `${randomEmail()}@example.com`;
  const test2Email = `${randomEmail()}@example.com`;
  const testPass = 'testing1';
  let token;
  
  describe('Registration: (/api/auth/register)', () => {
    it('should respond with success', (done) => {
      chai.request(server)
        .post('/api/auth/register')
        .send({ 'email': testEmail, 'password': testPass })
        .end((err, res) =>{
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          res.body.should.have.property('token');
          res.body.should.have.property('message');
          res.body.message.should.equal('registration success');
          done();
        });
    });
    it('should respond with error if email is already in use', (done) => {
      chai.request(server)
        .post('/api/auth/register')
        .send({ 'email': testEmail, 'password': testPass })
        .end((err, res) =>{
          res.should.have.status(500);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('email is already in use, please try another');
          done();
        });
    });
    it('should respond with error if no email is included', (done) => {
      chai.request(server)
        .post('/api/auth/register')
        .send({'password': testPass })
        .end((err, res) =>{
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('missing email or password');
          done();
        });
    });
    it('should respond with error if no password is included', (done) => {
      chai.request(server)
        .post('/api/auth/register')
        .send({ 'email': testEmail })
        .end((err, res) =>{
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('missing email or password');
          done();
        });
    });
  });

  describe('Login: (/api/auth/login)', () => {
    it('should respond with success', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({ 'email': testEmail, 'password': testPass })
        .end((err, res) =>{
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          res.body.should.have.property('token');
          res.body.should.have.property('message');
          res.body.message.should.equal('login success');
          token = res.body.token;
          done();
        });
    });
    it('should respond with error to an invalid email', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({ 'email': test2Email, 'password': testPass })
        .end((err, res) =>{
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('incorrect email or password');
          done();
        });
    });
    it('should respond with error with incorrect password', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({ 'email': testEmail, 'password': 'testPass' })
        .end((err, res) =>{
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('incorrect email or password');
          done();
        });
    });
    it('should response with error if no email is included', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({'password': testPass })
        .end((err, res) =>{
          res.should.have.status(422);
          done();
        });
    });
    it('should response with error if no password is included', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .send({ 'email': testEmail })
        .end((err, res) =>{
          res.should.have.status(422);
          done();
        });
    });
  });

  describe('Update Email: (/api/auth/update-email)', () => {
    it('should respond with error if token is not included', (done) => {
      chai.request(server)
        .put('/api/auth/update-email')
        .end((err, res) => {
          res.should.have.status(403);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('token required');
          done();
        });
    });
    it('should respond with error if newEmail is not included', (done) => {
      chai.request(server)
        .put('/api/auth/update-email')
        .send({
          'token': token,
          'password': 'test', 
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('please include newEmail and password');
          done();
        });
    });
    it('should respond with error if password is not included', (done) => {
      chai.request(server)
        .put('/api/auth/update-email')
        .send({
          'token': token,
          'newEmail': 'test@example.com',
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('please include newEmail and password');
          done();
        });
    });
    it('should respond with error if password is not correct', (done) => {
      chai.request(server)
        .put('/api/auth/update-email')
        .send({
          'token': token,
          'password': 'test123x',
          'newEmail': 'test@example.com',
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('incorrect password');
          done();
        });
    });
    it('should respond with success', (done) => {
      chai.request(server)
        .put('/api/auth/update-email')
        .send({
          'token': token,
          'newEmail': test2Email,
          'password': testPass,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          res.body.should.have.property('message');
          res.body.message.should.equal('email updated');
          done();
        });
    });
    it('should respond with error if email is already in use', (done) => {
      chai.request(server)
        .put('/api/auth/update-email')
        .send({
          'token': token,
          'newEmail': test2Email,
          'password': testPass,
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('That email is already taken, please try another.');
          done();
        });
    });
  });

  describe('Update Password: (/api/auth/update-pass)', () => {
    it('should respond with error if token is not included', (done) => {
      chai.request(server)
        .put('/api/auth/update-pass')
        .end((err, res) => {
          res.should.have.status(403);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('token required');
          done();
        });
    });
    it('should respond with error if currentPass is not included', (done) => {
      chai.request(server)
        .put('/api/auth/update-pass')
        .send({
          'token': token,
          'newPass': 'test', 
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('include passwords');
          done();
        });
    });
    it('should respond with error if newPass is not included', (done) => {
      chai.request(server)
        .put('/api/auth/update-pass')
        .send({
          'token': token,
          'currentPass': 'currentPass',
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('include passwords');
          done();
        });
    });
    it('should respond with error if current password is not correct', (done) => {
      chai.request(server)
        .put('/api/auth/update-pass')
        .send({
          'token': token,
          'currentPass': 'currentPass',
          'newPass': 'newPass',
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('current password incorrect');
          done();
        });
    });
    it('should respond with success', (done) => {
      chai.request(server)
        .put('/api/auth/update-pass')
        .send({
          'token': token,
          'currentPass': testPass,
          'newPass': 'testPass',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          res.body.should.have.property('message');
          res.body.message.should.equal('password updated');
          done();
        });
    });
  });

  describe('Facebook Auth: (/api/auth/facebook)', () => {
    it('should respond with error if accessToken is not included', (done) => {
      chai.request(server)
        .post('/api/auth/facebook')
        .send({
          'id': 'test',
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('your request is missing information');
          done();
        });
    });
    it('should respond with error if id is not included', (done) => {
      chai.request(server)
        .post('/api/auth/facebook')
        .send({
          'accessToken': 'accessToken',
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('your request is missing information');
          done();
        });
    });
    it('should respond with error if access_token is invalid', (done) => {
      chai.request(server)
        .post('/api/auth/facebook')
        .send({
          'accessToken': 'accessToken',
          'id': 'id',
        })
        .end((err, res) => {
          res.should.have.status(500);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('Invalid OAuth access token.');
          done();
        });
    });
  });
  describe('Google Auth: (/api/auth/google)', () => {
    it('should respond with error if accessToken is not included', (done) => {
      chai.request(server)
        .post('/api/auth/google')
        .end((err, res) => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('your request is missing information');
          done();
        });
    });
    it('should respond with error if access_token is invalid', (done) => {
      chai.request(server)
        .post('/api/auth/google')
        .send({
          'accessToken': 'accessToken',
        })
        .end((err, res) => {
          res.should.have.status(500);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          res.body.message.should.equal('invalid_grant');
          done();
        });
    });
  });
});
