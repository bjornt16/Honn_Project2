//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
let server;

chai.use(chaiHttp);

describe('User', () => {
    before(function(done) {
      server = require( '../index' );
      mockgoose.prepareStorage().then(function() {
            mongoose.connect('mongodb://admin:honnpro2@ds139193.mlab.com:39193/honn_project2', { useNewUrlParser: true}, function(err) {
                done(err);
            }); 
      });
    });
    after(async function() {
      await mockgoose.helper.reset();
      await mongoose.disconnect();
      mockgoose.mongodHelper.mongoBin.childProcess.kill('SIGTERM');
    });
    /*
    after(function(done) {
      server.server.close();
      mongoose.connection.close();
      process.exit(0);
    });
    */
  /*
  * Test the /GET route
  */
  describe('/GET Users', () => {
      it('it should GET all the users', (done) => {
        chai.request(server)
            .get('/users')
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('array');
              done();
            });
      });
  });

});