//During the test the env variable is set to test
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const Mockgoose = require("mockgoose").Mockgoose;
const mockgoose = new Mockgoose(mongoose);

//Require the dev-dependencies
const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert,
      expect = chai.expect,
      should = chai.should();
let server;

let db;

chai.use(chaiHttp);

describe("Tapes Route", () => {

  let createdTapeId;
  let tape = {
    title: "Bob's Movie",
    director_first_name: "Bill",
    director_last_name: "Builder",
    type: "DVD",
    release_date: "2018-10-27",
    eidr: "555-5555-555-5555"
  };

  before(function(done) {
    server = require( "../index" );
    db = require("../data/db.js");
    mockgoose.prepareStorage().then(function() {
          mongoose.connect("mongodb://admin:honnpro2@ds139193.mlab.com:39193/honn_project2", { useNewUrlParser: true}, function(err) {
            done();
          }); 
    });
  });

  after(async function() {
    server.server.close();
    mongoose.connection.close();
  });

  describe("GET /tapes", () => {
    let success;
    before(function(done) {
      chai.request(server)
          .get("/tapes")
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            done();
          });
    });

    describe("Getting all tapes", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of tapes (if any)", (done) => {
        success.body.data.should.be.a("array");
        done();
      });
    });

  });

  describe("Post /tapes", () => {
      let success, missing, invalid;

      before(function(done) {
        chai.request(server)
            .post("/tapes")
            .send(tape)
            .end((err, res) => {
              createdTapeId = res.body.data[0].id;
              success = {
                err:err,
                res:res,
                body:res.body
              };
              chai.request(server)
                .post("/tapes")
                .send({})
                .end((err, res) => {
                  missing = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                  tmp = Object.assign({}, tape);
                  tmp.phone = "555";
                  tmp.email = "my email";
                  chai.request(server)
                      .post("/tapes")
                      .send(tmp)
                      .end((err, res) => {
                        invalid = {
                          err:err,
                          res:res,
                          body:res.body
                        };
                      done();
                  });
            });
        });
      });

      describe("Create tape with missing fields", () => {
        it("it should have status code 422", (done) => {
          missing.res.should.have.status(422);
          done();
        });
        it("it should have fail status", (done) => {
          missing.body.status.should.be.eql("fail");
          done();
        });
        it("it should not allow title to be missing", (done) => {
          missing.body.data[0].should.have.property("title");
          done();
        });
        it("it should not allow director_first_name to be missing", (done) => {
          missing.body.data[1].should.have.property("director_first_name");
          done();
        });
        it("it should not allow director_last_name to be missing", (done) => {
          missing.body.data[2].should.have.property("director_last_name");
          done();
        });
        it("it should not allow type to be missing", (done) => {
          missing.body.data[3].should.have.property("type");
          done();
        });
        it("it should not allow release_date to be missing", (done) => {
          missing.body.data[4].should.have.property("release_date");
          done();
        });
        it("it should not allow eidr to be missing", (done) => {
          missing.body.data[5].should.have.property("eidr");
          done();
        });
      });

      describe("Create valid tape", () => {
        it("it should have status code 201", (done) => {
          success.res.should.have.status(201);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the user object created", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("director_first_name");
          success.body.data[0].should.have.property("director_last_name");
          success.body.data[0].should.have.property("type");
          success.body.data[0].should.have.property("eidr");
          done();
        });

      });
      
  });

  describe("GET /tapes/{tape_id}", () => {
    let success, fail;

    before(function(done) {
        chai.request(server)
            .get("/tapes/"+createdTapeId)
            .end((err, res) => {
              success = {
                err:err,
                res:res,
                body:res.body
              };
              chai.request(server)
                .get("/tapes/"+"0000")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                };
                done();
              });
        });
    });

    describe("Get existing tape", () => {

        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the user object created", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("director_first_name");
          success.body.data[0].should.have.property("director_last_name");
          success.body.data[0].should.have.property("type");
          success.body.data[0].should.have.property("release_date");
          success.body.data[0].should.have.property("eidr");
          done();
        });

    });

    describe("Get non existing tape", () => {

        it("it should have status code 404", (done) => {
          fail.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fail.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fail.body.data.should.be.a("array");
          fail.body.data[0].should.be.a("object");
          fail.body.data[0].should.have.property("Tape");
          done();
        });

    });
  });

  describe("PUT /tapes/{tape_id}", () => {
    let success, fail, invalid;

    let userEdit = {
      title: "Bob's Movie 2",
      director_first_name: "Bob",
      director_last_name: "Rock",
      type: "VHS",
      eidr: "555-5555-555-5551"
    };

    before(function(done) {
      chai.request(server)
          .put("/tapes/"+createdTapeId)
          .send(userEdit)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .put("/tapes/"+"0000")
              .send(userEdit)
              .end((err, res) => {
                fail = {
                  err:err,
                  res:res,
                  body:res.body
              };
              tmp = Object.assign({}, userEdit);
              tmp.type = "movie";
              chai.request(server)
                .put("/tapes/"+createdTapeId)
                .send(tmp)
                .end((err, res) => {
                  invalid = {
                    err:err,
                    res:res,
                    body:res.body
                };
                done();
              });
            });
      });
    });

    describe("Modify existing tape", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the modified tape object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].title.should.be.eql(userEdit.title);
          success.body.data[0].should.have.property("director_first_name");
          success.body.data[0].director_first_name.should.be.eql(userEdit.director_first_name);
          success.body.data[0].should.have.property("director_last_name");
          success.body.data[0].director_last_name.should.be.eql(userEdit.director_last_name);
          success.body.data[0].should.have.property("type");
          success.body.data[0].type.should.be.eql(userEdit.type);
          success.body.data[0].should.have.property("eidr");
          success.body.data[0].eidr.should.be.eql(userEdit.eidr);
          success.body.data[0].should.have.property("id");
          done();
        });

    });

    describe("Modify existing tape, with invalid fields", () => {
        it("it should have status code 422", (done) => {
          invalid.res.should.have.status(422);
          done();
        });
        it("it should have fail status", (done) => {
          invalid.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          invalid.body.data.should.be.a("array");
          invalid.body.data[0].should.be.a("object");
          done();
        });
        it("it should not allow type to have invalid format. (valid example 'Betamax', 'VHS', 'DVD', 'Blu-Ray')", (done) => {
          invalid.body.data[0].should.have.property("type");
          done();
        });
    });

    describe("Modify non existing tape", () => {
        it("it should have status code 404", (done) => {
          fail.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fail.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fail.body.data.should.be.a("array");
          fail.body.data[0].should.be.a("object");
          fail.body.data[0].should.have.property("Tape");
          done();
        });

    });
  });

  describe("DELETE /tapes/{tape_id}", () => {
    let success, fail;

    before(function(done) {
      chai.request(server)
          .delete("/tapes/"+createdTapeId)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .delete("/tapes/"+"0000")
              .end((err, res) => {
                fail = {
                  err:err,
                  res:res,
                  body:res.body
              };
              done();
            });
      });
    });

    describe("Remove existing tape", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the deleted tape object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("director_first_name");
          success.body.data[0].should.have.property("director_last_name");
          success.body.data[0].should.have.property("type");
          success.body.data[0].should.have.property("release_date");
          success.body.data[0].should.have.property("eidr");
          done();
        });

    });

    describe("Remove non existing tape", () => {
        it("it should have status code 404", (done) => {
          fail.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fail.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fail.body.data.should.be.a("array");
          fail.body.data[0].should.be.a("object");
          done();
        });
    });

  });

});