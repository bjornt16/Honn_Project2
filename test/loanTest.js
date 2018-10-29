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

describe("Loans Route", () => {

  let createdUserId;
  let createdTapeId;
  let createdLoanId;
  let user = {
    first_name: "Bob",
    last_name: "Builder",
    email: "bob@builder.com",
    phone: "555-5555",
    address: "Build Drv. 444455"
  };
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


  describe("GET /loans", () => {
    let success;
    before(function(done) {
      chai.request(server)
        .post("/users")
        .send(user)
        .end((err, res) => {
          createdUserId = res.body.data[0].id;
          chai.request(server)
              .post("/tapes")
              .send(tape)
              .end((err, res) => {
                createdTapeId = res.body.data[0].id;
                chai.request(server)
                    .get("/loans")
                    .end((err, res) => {
                      success = {
                        err:err,
                        res:res,
                        body:res.body
                      };
                      done();
                });
          });
      });
    });

    describe("Getting all loans", ()=>{
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of loans (if any)", (done) => {
        success.body.data.should.be.a("array");
        done();
      });
    });
  });

  describe("Post /users/{user_id}/tapes/{tape_id}", () => {
      let success, reloan, fail;

      before(function(done) {
        chai.request(server)
            .post("/users/"+createdUserId+"/tapes/"+createdTapeId)
            .end((err, res) => {
              createdLoanId = res.body.data[0].id;
              success = {
                err:err,
                res:res,
                body:res.body
              };
            chai.request(server)
                .post("/users/000/tapes/000")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                chai.request(server)
                    .post("/users/"+createdUserId+"/tapes/"+createdTapeId)
                    .end((err, res) => {
                      reloan = {
                        err:err,
                        res:res,
                        body:res.body
                      };
                    done();
                });
            });
        });
      });

    describe("Register a tape on loan", () => {
      it("it should have status code 201", (done) => {
        success.res.should.have.status(201);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return the loan object created", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        success.body.data[0].should.have.property("user_id");
        success.body.data[0].should.have.property("tape_id");
        success.body.data[0].should.have.property("loan_date");
        success.body.data[0].should.have.property("id");
        done();
      }); 
    });

    describe("Register a tape that user already has on loan", () => {
      it("it should have status code 409", (done) => {
        reloan.res.should.have.status(409);
        done();
      });
      it("it should have fail status", (done) => {
        reloan.body.status.should.be.eql("fail");
        done();
      });
      it("it should return an error", (done) => {
        reloan.body.data.should.be.a("array");
        reloan.body.data[0].should.be.a("object");
        done();
      }); 
    });

    describe("Register a tape on loan for non existing user", () => {
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
        fail.body.data[1].should.have.property("User");
        done();
      }); 
    });

    describe("Register a tape on loan for non existing tape", () => {
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

  describe("DELETE /users/{user_id}/tapes/{tape_id}", () => {
    let success, returnin, fail;

    before(function(done) {
      chai.request(server)
          .delete("/users/"+createdUserId+"/tapes/"+createdTapeId)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
                .delete("/users/000/tapes/000)")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                chai.request(server)
                    .delete("/users/"+createdUserId+"/tapes/"+createdTapeId)
                    .end((err, res) => {
                      returnin = {
                        err:err,
                        res:res,
                        body:res.body
                      };
                    done();
                });
            });
      });
    });

    describe("Return a tape", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return the loan object created", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        success.body.data[0].should.have.property("user_id");
        success.body.data[0].should.have.property("tape_id");
        success.body.data[0].should.have.property("loan_date");
        success.body.data[0].should.have.property("id");
        done();
      }); 
    });

    describe("Return a tape that user doesnt have on loan", () => {
      it("it should have status code 400", (done) => {
        returnin.res.should.have.status(400);
        done();
      });
      it("it should have fail status", (done) => {
        returnin.body.status.should.be.eql("fail");
        done();
      });
      it("it should return an error", (done) => {
        returnin.body.data.should.be.a("array");
        returnin.body.data[0].should.be.a("object");
        done();
      }); 
    });

    describe("Return a tape for non existing user", () => {
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

    describe("Return a tape for non existing tape", () => {
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

  describe("GET /users/{user_id}/loans", () => {
    let success, fail;

    before(function(done) {
      chai.request(server)
          .get("/users/"+createdUserId+"/loans/")
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .get("/users/000/loans/")
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

  describe("Get existing user's loans", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of all his/her loans (if any)", (done) => {
        success.body.data.should.be.a("array");
        done();
      });
    });

    describe("Get non existing user's loans", () => {
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
        fail.body.data[0].should.have.property("User");
        done();
      });
    });
  });

  describe("GET /loans/{loan_id}", () => {
    let success, fail;

    before(function(done) {
      chai.request(server)
          .get("/loans/"+createdLoanId)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .get("/loans/000")
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

    describe("Get existing loan", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a loan object", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        done();
      });
    });

    describe("Get non existing loan", () => {
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
        fail.body.data[0].should.have.property("Loan");
        done();
      });
    });
  });

  describe("PUT /loans/{loan_id}", () => {
    let success, fail;
    before(function(done) {
      chai.request(server)
          .put("/loans/"+createdLoanId)
          .send({loan_date: "2018-01-01"})
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .put("/loans/000")
              .send({loan_date: "2018-01-01"})
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

    describe("modify existing loan", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return the modified loan object", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        done();
      });
    });

    describe("modify non existing loan", () => {
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
        fail.body.data[0].should.have.property("Loan");
        done();
      });
    });
  });


  describe("PUT /users/{loan_id}/tapes/{tape_id}", () => {
    let success, fail;
    before(function(done) {
      chai.request(server)
          .put("/users/"+createdUserId+"/tapes/"+createdTapeId)
          .send({loan_date: "2018-01-01"})
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .put("/users/000/tapes/000")
              .send({loan_date: "2018-01-01"})
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

    describe("modify existing loan", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return the modified loan object", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        Date.parse(success.body.data[0].loan_date).should.be.eql(new Date("2018-01-01").getTime());
        done();
      });
    });

    describe("modify non existing loan", () => {
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
        fail.body.data[1].should.have.property("User");
        done();
      });
    });
  });

  describe("GET /users/{userId}/loans", () => {
    let success, fail;
    before(function(done) {
      chai.request(server)
          .get("/users/"+createdUserId+"/loans")
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .get("/users/000/loans")
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

    describe("get an existing user's loans", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of the user's loans (if any)", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        success.body.data[0].id.should.be.eql(createdLoanId);
        done();
      });
    });

    describe("get a non existing user's loans", () => {
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
        fail.body.data[0].should.have.property("User");
        done();
      });
    });
  });


  describe("GET /tapes/{tapeId}/loans", () => {
    let success, fail;
    before(function(done) {
      chai.request(server)
          .get("/tapes/"+createdTapeId+"/loans")
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .get("/tapes/000/loans")
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

    describe("get an existing tapes's loans", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of the user's loans (if any)", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        success.body.data[0].id.should.be.eql(createdLoanId);
        done();
      });

    });

    describe("get a non existing tapes's loans", () => {
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

  let newLoan;
  describe("GET /users/{userId}/tapes/{tapeId}/loans", () => {
    let success, fail, fakeUser, fakeTape;
    before(function(done) {
      chai.request(server)
        .post("/users/"+createdUserId+"/tapes/"+createdTapeId)
        .end((err, res) => {
          newLoan = res.body.data[0].id;
          fail = {
            err:err,
            res:res,
            body:res.body
        };
        chai.request(server)
            .get("/users/"+createdUserId+"/tapes/"+createdTapeId+"/loans")
            .end((err, res) => {
              success = {
                err:err,
                res:res,
                body:res.body
              };
              chai.request(server)
                .get("/users/000/tapes/000/loans")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                };
                chai.request(server)
                  .get("/users/000/tapes/"+createdTapeId+"/loans")
                  .end((err, res) => {
                    fakeTape = {
                      err:err,
                      res:res,
                      body:res.body
                  };
                  chai.request(server)
                    .get("/users/"+createdUserId+"/tapes/000/loans")
                    .end((err, res) => {
                      fakeUser = {
                        err:err,
                        res:res,
                        body:res.body
                    };
                    done();
                  });
                });
              });
        });
      });
    });

    describe("get an existing user's loan history for an existing tape", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of the user's loans for the tape", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        success.body.data[1].id.should.be.eql(createdLoanId);
        success.body.data[0].id.should.be.eql(newLoan);
        done();
      });
    });

    describe("get a non existing user's loan history for an existing tape", () => {
      it("it should have status code 404", (done) => {
        fakeUser.res.should.have.status(404);
        done();
      });
      it("it should have fail status", (done) => {
        fakeUser.body.status.should.be.eql("fail");
        done();
      });
      it("it should return an error", (done) => {
        fakeUser.body.data.should.be.a("array");
        fakeUser.body.data[0].should.be.a("object");
        fakeUser.body.data[0].should.have.property("Tape");
        done();
      });
    });

    describe("get an existing user's loan history for a non existing tape", () => {
      it("it should have status code 404", (done) => {
        fakeUser.res.should.have.status(404);
        done();
      });
      it("it should have fail status", (done) => {
        fakeUser.body.status.should.be.eql("fail");
        done();
      });
      it("it should return an error", (done) => {
        fakeUser.body.data.should.be.a("array");
        fakeUser.body.data[0].should.be.a("object");
        fakeUser.body.data[0].should.have.property("Tape");
        done();
      });
    });

    describe("get a non existing user's loan history for a non existing tape", () => {
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
        fail.body.data[1].should.have.property("User");
        fail.body.data[0].should.have.property("Tape");
        done();
      });
    });

  });

describe("GET /tapes/{tapeId}/users/{userId}/loans", () => {
    let success, fail, fakeUser, fakeTape;
    before(function(done) {
      chai.request(server)
          .get("/tapes/"+createdTapeId+"/users/"+createdUserId+"/loans")
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .get("/tapes/000/users/000/loans")
              .end((err, res) => {
                fail = {
                  err:err,
                  res:res,
                  body:res.body
              };
              chai.request(server)
                .get("/tapes/000/users/"+createdUserId+"/loans")
                .end((err, res) => {
                  fakeTape = {
                    err:err,
                    res:res,
                    body:res.body
                };
                chai.request(server)
                  .get("/tapes/"+createdTapeId+"/users/000/loans")
                  .end((err, res) => {
                    fakeUser = {
                      err:err,
                      res:res,
                      body:res.body
                  };
                  done();
                });
              });
            });
      });
    });

    describe("get an existing tapes's loan history for an existing user", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of the tapes's loans for the user", (done) => {
        success.body.data.should.be.a("array");
        success.body.data[0].should.be.a("object");
        success.body.data[1].id.should.be.eql(createdLoanId);
        success.body.data[0].id.should.be.eql(newLoan);
        done();
      });
    });

    describe("get a non existing tapes's loan history for an existing user", () => {
      it("it should have status code 404", (done) => {
        fakeUser.res.should.have.status(404);
        done();
      });
      it("it should have fail status", (done) => {
        fakeUser.body.status.should.be.eql("fail");
        done();
      });
      it("it should return an error", (done) => {
        fakeUser.body.data.should.be.a("array");
        fakeUser.body.data[0].should.be.a("object");
        fakeUser.body.data[0].should.have.property("User");
        done();
      });
    });

    describe("get an existing user's loan history for a non existing tape", () => {
      it("it should have status code 404", (done) => {
        fakeUser.res.should.have.status(404);
        done();
      });
      it("it should have fail status", (done) => {
        fakeUser.body.status.should.be.eql("fail");
        done();
      });
      it("it should return an error", (done) => {
        fakeUser.body.data.should.be.a("array");
        fakeUser.body.data[0].should.be.a("object");
        fakeUser.body.data[0].should.have.property("User");
        done();
      });
    });

    describe("get a non existing tapes's loan history for a non existing user", () => {
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
        fail.body.data[1].should.have.property("User");
        fail.body.data[0].should.have.property("Tape");
        done();
      });
    });

  });

});
