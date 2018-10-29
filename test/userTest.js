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

describe("Users Route", () => {

  let createdUserId;
  let user = {
    first_name: "Bob",
    last_name: "Builder",
    email: "bob@builder.com",
    phone: "555-5555",
    address: "Build Drv. 444455"
  };

  before(function(done) {
    server = require( "../index" );
    db = require("../data/db.js");
    mockgoose.prepareStorage().then(function() {
          mongoose.connect("mongodb://admin:honnpro2@ds139193.mlab.com:39193/honn_project2", { useNewUrlParser: true}, function(err) {
              db.review.deleteMany({}, (err, user) => {
                done(err);
              });
          }); 
    });
  });

  describe("GET /users", () => {
    let success;
    before(function(done) {
      chai.request(server)
          .get("/users")
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            done();
          });
    });
    describe("Getting all users", () => {
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of users (if any)", (done) => {
        success.body.data.should.be.a("array");
        done();
      });
    });

  });

  describe("Post /users", () => {
      let success, missing, invalid;

      before(function(done) {
        chai.request(server)
            .post("/users")
            .send(user)
            .end((err, res) => {
              createdUserId = res.body.data[0].id;
              success = {
                err:err,
                res:res,
                body:res.body
              };
              chai.request(server)
                .post("/users")
                .send({})
                .end((err, res) => {
                  missing = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                  tmp = Object.assign({}, user);
                  tmp.phone = "555";
                  tmp.email = "my email";
                  chai.request(server)
                      .post("/users")
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

      describe("Create user with missing fields", () => {
        it("it should have status code 422", (done) => {
          missing.res.should.have.status(422);
          done();
        });
        it("it should have fail status", (done) => {
          missing.body.status.should.be.eql("fail");
          done();
        });
        it("it should not allow first_name to be missing", (done) => {
          missing.body.data[0].should.have.property("first_name");
          done();
        });
        it("it should not allow last_name to be missing", (done) => {
          missing.body.data[1].should.have.property("last_name");
          done();
        });
        it("it should not allow email to be missing", (done) => {
          missing.body.data[2].should.have.property("email");
          done();
        });
        it("it should not allow phone to be missing", (done) => {
          missing.body.data[3].should.have.property("phone");
          done();
        });
        it("it should not allow address to be missing", (done) => {
          missing.body.data[4].should.have.property("address");
          done();
        });
      });


      describe("Create user with invalid fields", () => {
        it("it should have status code 422", (done) => {
          invalid.res.should.have.status(422);
          done();
        });
        it("it should have fail status", (done) => {
          invalid.body.status.should.be.eql("fail");
          done();
        });
        it("it should not allow phone to have invalid format. (valid example 999-9999)", (done) => {
          invalid.body.data[1].should.have.property("phone");
          done();
        });
        it("it should not allow email to have invalid format. (valid example user@email.com)", (done) => {
          invalid.body.data[0].should.have.property("email");
          done();
        });
      });

      describe("Post valid user", () => {
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
          success.body.data[0].should.have.property("first_name");
          success.body.data[0].should.have.property("last_name");
          success.body.data[0].should.have.property("email");
          success.body.data[0].should.have.property("phone");
          success.body.data[0].should.have.property("address");
          success.body.data[0].should.have.property("id");
          done();
        });

      });
      
  });

  describe("GET /users/{user_id}", () => {

    let success, fail;

    before(function(done) {
        chai.request(server)
            .get("/users/"+createdUserId)
            .end((err, res) => {
              success = {
                err:err,
                res:res,
                body:res.body
              };
              chai.request(server)
                .get("/users/"+"0000")
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

    describe("Get existing user", () => {

        it("it should have status code 201", (done) => {
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
          success.body.data[0].should.have.property("first_name");
          success.body.data[0].should.have.property("last_name");
          success.body.data[0].should.have.property("email");
          success.body.data[0].should.have.property("phone");
          success.body.data[0].should.have.property("address");
          success.body.data[0].should.have.property("id");
          done();
        });

    });

    describe("Get non existing user", () => {

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

  describe("PUT /users/{user_id}", () => {
    let success, fail, invalid;

    let userEdit = {
      first_name: "Rob",
      last_name: "Robber",
      email: "rob@robber.com",
      phone: "333-3333",
      address: "Rob Blvd. 999666"
    };

    before(function(done) {
      chai.request(server)
          .put("/users/"+createdUserId)
          .send(userEdit)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .put("/users/"+"0000")
              .send(userEdit)
              .end((err, res) => {
                fail = {
                  err:err,
                  res:res,
                  body:res.body
              };
              tmp = Object.assign({}, userEdit);
              tmp.phone = "333";
              tmp.email = "email";
              chai.request(server)
                .put("/users/"+createdUserId)
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

    describe("modify existing user", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the modified user object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("first_name");
          success.body.data[0].first_name.should.be.eql(userEdit.first_name);
          success.body.data[0].should.have.property("last_name");
          success.body.data[0].last_name.should.be.eql(userEdit.last_name);
          success.body.data[0].should.have.property("email");
          success.body.data[0].email.should.be.eql(userEdit.email);
          success.body.data[0].should.have.property("phone");
          success.body.data[0].phone.should.be.eql(userEdit.phone);
          success.body.data[0].should.have.property("address");
          success.body.data[0].address.should.be.eql(userEdit.address);
          success.body.data[0].should.have.property("id");
          done();
        });

    });

    describe("modify existing user, with invalid fields", () => {
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
        it("it should not allow phone to have invalid format. (valid example 999-9999)", (done) => {
          invalid.body.data[0].should.have.property("phone");
          done();
        });
        it("it should not allow email to have invalid format. (valid example user@email.com)", (done) => {
          invalid.body.data[1].should.have.property("email");
          done();
        });
    });

    describe("modify non existing user", () => {
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

  describe("DELETE /users/{user_id}", () => {
    let success, fail;

    before(function(done) {
      chai.request(server)
          .delete("/users/"+createdUserId)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .delete("/users/"+"0000")
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

    describe("remove existing user", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the deleted user object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("first_name");
          success.body.data[0].should.have.property("last_name");
          success.body.data[0].should.have.property("email");
          success.body.data[0].should.have.property("phone");
          success.body.data[0].should.have.property("address");
          success.body.data[0].should.have.property("id");
          done();
        });

    });

    describe("remove non existing user", () => {
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
