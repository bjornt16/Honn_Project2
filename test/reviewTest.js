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

describe("Reviws Route", () => {

  let createdUserId;
  let createdTapeId;
  let createdReviewId;
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

  let review = {
    title: "my review",
    rating: 5,
    comment: "i liked it."
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

  describe("GET /tapes/reviews", () => {
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

    describe("Getting all reviews", ()=>{
      it("it should have status code 200", (done) => {
        success.res.should.have.status(200);
        done();
      });
      it("it should have success status", (done) => {
        success.body.status.should.be.eql("success");
        done();
      });
      it("it should return a list of reviews (if any)", (done) => {
        success.body.data.should.be.a("array");
        done();
      });
    });
  });


  describe("Post /users/{userId}/reviews/{tapeId}", () => {
      let success, reReview, fakeUser, fakeTape, fail;

      before(function(done) {
        chai.request(server)
            .post("/users/"+createdUserId+"/reviews/"+createdTapeId)
            .send(review)
            .end((err, res) => {
              createdReviewId = res.body.data[0].id;
              success = {
                err:err,
                res:res,
                body:res.body
              };
            chai.request(server)
                .post("/users/000/reviews/000")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                chai.request(server)
                    .post("/users/"+createdUserId+"/reviews/"+createdTapeId)
                    .end((err, res) => {
                      reReview = {
                        err:err,
                        res:res,
                        body:res.body
                      };
                    chai.request(server)
                        .post("/users/000/reviews/"+createdTapeId)
                        .end((err, res) => {
                          fakeUser = {
                            err:err,
                            res:res,
                            body:res.body
                          };
                        chai.request(server)
                            .post("/users/"+createdUserId+"/reviews/000")
                            .end((err, res) => {
                              fakeTape = {
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

      describe("An existing user reviews existing tape", () => {
        it("it should have status code 201", (done) => {
          success.res.should.have.status(201);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the review object created", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("user_id");
          success.body.data[0].should.have.property("tape_id");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("rating");
          success.body.data[0].should.have.property("comment");
          done();
        }); 
      });

      describe("An existing user reviews the same existing tape", () => {
        it("it should have status code 409", (done) => {
          reReview.res.should.have.status(409);
          done();
        });
        it("it should have fail status", (done) => {
          reReview.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          reReview.body.data.should.be.a("array");
          reReview.body.data[0].should.be.a("object");
          done();
        }); 
      });

      describe("An existing user reviews a non existing tape", () => {
        it("it should have status code 404", (done) => {
          fakeTape.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fakeTape.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fakeTape.body.data.should.be.a("array");
          fakeTape.body.data[0].should.be.a("object");
          done();
        }); 
      });


      describe("A non existing user reviews an existing tape", () => {
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
          done();
        }); 
      });

  });

  describe("GET /users/{userId}/reviews", () => {
      let success, fail;

      before(function(done) {
        chai.request(server)
            .get("/users/"+createdUserId+"/reviews")
            .end((err, res) => {
              success = {
                err:err,
                res:res,
                body:res.body
              };
            chai.request(server)
                .get("/users/000/reviews")
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

      describe("get an existing users reviews", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return a list of reviews (if any)", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("user_id");
          success.body.data[0].should.have.property("tape_id");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("rating");
          success.body.data[0].should.have.property("comment");
          done();
        }); 
      });

      describe("get a non existing users reviews", () => {
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


  describe("GET /tapes/{tapeId}/reviews", () => {
      let success, fail;

      before(function(done) {
        chai.request(server)
            .get("/tapes/"+createdTapeId+"/reviews")
            .end((err, res) => {
              success = {
                err:err,
                res:res,
                body:res.body
              };
            chai.request(server)
                .get("/tapes/000/reviews")
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

      describe("get an existing users reviews", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return a list of reviews (if any)", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("user_id");
          success.body.data[0].should.have.property("tape_id");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("rating");
          success.body.data[0].should.have.property("comment");
          done();
        }); 
      });

      describe("get a non existing users reviews", () => {
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

  describe("GET /users/{userId}/reviews/{tapeId}", () => {
      let success, fail, fakeUser, fakeTape;

      before(function(done) {
        chai.request(server)
            .get("/users/"+createdUserId+"/reviews/"+createdTapeId)
            .end((err, res) => {
              success = {
                err:err,
                res:res,
                body:res.body
              };
            chai.request(server)
                .get("/users/000/reviews/000")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                chai.request(server)
                    .get("/users/"+createdUserId+"/reviews/000")
                    .end((err, res) => {
                      fakeTape = {
                        err:err,
                        res:res,
                        body:res.body
                      };
                    chai.request(server)
                        .get("/users/000/reviews/"+createdTapeId)
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

      describe("get an existing users reviews for an existing tape", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return a list of reviews (if any)", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("user_id");
          success.body.data[0].should.have.property("tape_id");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("rating");
          success.body.data[0].should.have.property("comment");
          done();
        }); 
      });

      describe("get an existing users reviews for a non existing tape", () => {
        it("it should have status code 404", (done) => {
          fakeTape.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fakeTape.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fakeTape.body.data.should.be.a("array");
          fakeTape.body.data[0].should.be.a("object");
          done();
        }); 
      });

      describe("get a non existing users reviews for an existing tape", () => {
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
          done();
        }); 
      });

      describe("get a non existing users reviews for a non existing tape", () => {
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

  describe("GET /tapes/{tapeId}/reviews/{userId}", () => {
      let success, fail, fakeUser, fakeTape;

      before(function(done) {
        chai.request(server)
            .get("/tapes/"+createdTapeId+"/reviews/"+createdUserId)
            .end((err, res) => {
              success = {
                err:err,
                res:res,
                body:res.body
              };
            chai.request(server)
                .get("/users/000/reviews/000")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                chai.request(server)
                    .get("/tapes/000/reviews/"+createdUserId)
                    .end((err, res) => {
                      fakeTape = {
                        err:err,
                        res:res,
                        body:res.body
                      };
                    chai.request(server)
                        .get("/tapes/"+createdTapeId+"/reviews/000")
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

      describe("get an existing tape's review from an existing user", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return a list of reviews (if any)", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("user_id");
          success.body.data[0].should.have.property("tape_id");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("rating");
          success.body.data[0].should.have.property("comment");
          done();
        }); 
      });

      describe("get an existing tape's review from a non existing user", () => {
        it("it should have status code 404", (done) => {
          fakeTape.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fakeTape.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fakeTape.body.data.should.be.a("array");
          fakeTape.body.data[0].should.be.a("object");
          done();
        }); 
      });

      describe("get a non existing tape's review from an existing user", () => {
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
          done();
        }); 
      });

      describe("get a non existing tape's review from a non existing user", () => {
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

  describe("PUT /tapes/{tapeId}/reviews/{userId}", () => {
    let success, fail, invalid, fakeUser, fakeTape;

    let reviewEdit = {
      title: "Omg",
      rating: 10,
      comment: "it's awesome."
    };

    before(function(done) {
      chai.request(server)
          .put("/tapes/"+createdTapeId+"/reviews/"+createdUserId)
          .send(reviewEdit)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .put("/tapes/000/reviews/"+createdUserId)
              .send(reviewEdit)
              .end((err, res) => {
                fakeTape = {
                  err:err,
                  res:res,
                  body:res.body
              };
              chai.request(server)
                .put("/tapes/"+createdTapeId+"/reviews/000")
                .send(reviewEdit)
                .end((err, res) => {
                  fakeUser = {
                    err:err,
                    res:res,
                    body:res.body
                };
                let tmp = Object.assign({}, reviewEdit);
                tmp.rating = 15;
                chai.request(server)
                  .put("/tapes/"+createdTapeId+"/reviews/"+createdUserId)
                  .send(tmp)
                  .end((err, res) => {
                    invalid = {
                      err:err,
                      res:res,
                      body:res.body
                  };
                  chai.request(server)
                    .put("/tapes/000/reviews/000")
                    .send(tmp)
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
            });
      });
    });

    describe("Modify an existing users review of an existing tape", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the modified review object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].title.should.be.eql(reviewEdit.title);
          success.body.data[0].should.have.property("rating");
          success.body.data[0].rating.should.be.eql(reviewEdit.rating);
          success.body.data[0].should.have.property("comment");
          success.body.data[0].comment.should.be.eql(reviewEdit.comment);
          done();
        });

    });

    describe("Modify an existing users review of an existing tape, with invalid fields", () => {
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
        it("it should not allow rating to have invalid format. (valid 0 to 10)", (done) => {
          invalid.body.data[0].should.have.property("rating");
          done();
        });
    });

    describe("Modify an existing users review of a non existing tape", () => {
        it("it should have status code 404", (done) => {
          fakeTape.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fakeTape.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fakeTape.body.data.should.be.a("array");
          fakeTape.body.data[0].should.be.a("object");
          fakeTape.body.data[0].should.have.property("Tape");
          done();
        });
    });

    describe("Modify a non existing users review of an existing tape", () => {
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

    describe("Modify a non existing users review of a non existing tape", () => {
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

  describe("PUT /users/{userId}/reviews/{tapeId}", () => {
    let success, fail, invalid, fakeUser, fakeTape;

    let reviewEdit = {
      title: "Omg",
      rating: 10,
      comment: "it's awesome."
    };

    before(function(done) {
      chai.request(server)
          .put("/users/"+createdUserId+"/reviews/"+createdTapeId)
          .send(reviewEdit)
          .end((err, res) => {
            success = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .put("/users/000/reviews/"+createdTapeId)
              .send(reviewEdit)
              .end((err, res) => {
                fakeUser = {
                  err:err,
                  res:res,
                  body:res.body
              };
              chai.request(server)
                .put("/users/"+createdUserId+"/reviews/000")
                .send(reviewEdit)
                .end((err, res) => {
                  fakeTape = {
                    err:err,
                    res:res,
                    body:res.body
                };
                let tmp = Object.assign({}, reviewEdit);
                tmp.rating = 15;
                chai.request(server)
                  .put("/users/"+createdUserId+"/reviews/"+createdTapeId)
                  .send(tmp)
                  .end((err, res) => {
                    invalid = {
                      err:err,
                      res:res,
                      body:res.body
                  };
                  chai.request(server)
                    .put("/users/000/reviews/reviews")
                    .send(tmp)
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
            });
      });
    });

    describe("Modify an existing tape's review from existing tape", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the modified review object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].title.should.be.eql(reviewEdit.title);
          success.body.data[0].should.have.property("rating");
          success.body.data[0].rating.should.be.eql(reviewEdit.rating);
          success.body.data[0].should.have.property("comment");
          success.body.data[0].comment.should.be.eql(reviewEdit.comment);
          done();
        });

    });

    describe("Modify an existing tape's review of an existing tape, with invalid fields", () => {
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
        it("it should not allow rating to have invalid format. (valid 0 to 10)", (done) => {
          invalid.body.data[0].should.have.property("rating");
          done();
        });
    });

    describe("Modify an existing tape's review of from a non existing user", () => {
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

    describe("Modify a non existing tape's review from an existing tape", () => {
        it("it should have status code 404", (done) => {
          fakeTape.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fakeTape.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fakeTape.body.data.should.be.a("array");
          fakeTape.body.data[0].should.be.a("object");
          fakeTape.body.data[0].should.have.property("Tape");
          done();
        });
    });

    describe("Modify a non existing tape's review from a non existing user", () => {
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

  describe("DELETE /users/{userId}/reviews/{tapeId}", () => {
    let success, fail, invalid, fakeUser, fakeTape;

    before(function(done) {
      chai.request(server)
          .delete("/users/000/reviews/000")
          .end((err, res) => {
            fail = {
              err:err,
              res:res,
              body:res.body
            };
            chai.request(server)
              .delete("/users/000/reviews/"+createdTapeId)
              .end((err, res) => {
                fakeUser = {
                  err:err,
                  res:res,
                  body:res.body
              };
              chai.request(server)
                .delete("/users/"+createdTapeId+"/reviews/000")
                .end((err, res) => {
                  fakeTape = {
                    err:err,
                    res:res,
                    body:res.body
                };
                chai.request(server)
                  .delete("/users/"+createdUserId+"/reviews/"+createdTapeId)
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
    });

    describe("remove an existing user's review of an existing tape", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the removed review object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("rating");
          success.body.data[0].should.have.property("comment");
          done();
        });

    });


    describe("remove an existing users review of a non existing tape", () => {
        it("it should have status code 404", (done) => {
          fakeTape.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fakeTape.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fakeTape.body.data.should.be.a("array");
          fakeTape.body.data[0].should.be.a("object");
          fakeTape.body.data[0].should.have.property("Tape");
          done();
        });
    });

    describe("remove a non existing users review of an existing tape", () => {
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

    describe("remove a non existing users review of a non existing tape", () => {
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

  describe("DELETE /tapes/{tapeId}/reviews/{userId}", () => {
    let success, fail, fakeUser, fakeTape;

    before(function(done) {
      chai.request(server)
          .post("/tapes/"+createdTapeId+"/reviews/"+createdUserId)
          .send(review)
          .end((err, res) => {
            chai.request(server)
                .delete("/tapes/000/reviews/000")
                .end((err, res) => {
                  fail = {
                    err:err,
                    res:res,
                    body:res.body
                  };
                  chai.request(server)
                    .delete("/tapes/000/reviews/"+createdUserId)
                    .end((err, res) => {
                      fakeTape = {
                        err:err,
                        res:res,
                        body:res.body
                    };
                    chai.request(server)
                      .delete("/tapes/"+createdTapeId+"/reviews/000")
                      .end((err, res) => {
                        fakeUser = {
                          err:err,
                          res:res,
                          body:res.body
                      };
                      chai.request(server)
                        .delete("/tapes/"+createdTapeId+"/reviews/"+createdUserId)
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
      });
    });

    describe("remove an existing user's review of an existing tape", () => {
        it("it should have status code 200", (done) => {
          success.res.should.have.status(200);
          done();
        });
        it("it should have success status", (done) => {
          success.body.status.should.be.eql("success");
          done();
        });
        it("it should return the removed review object", (done) => {
          success.body.data.should.be.a("array");
          success.body.data[0].should.be.a("object");
          success.body.data[0].should.have.property("title");
          success.body.data[0].should.have.property("rating");
          success.body.data[0].should.have.property("comment");
          done();
        });

    });


    describe("remove an existing users review of a non existing tape", () => {
        it("it should have status code 404", (done) => {
          fakeTape.res.should.have.status(404);
          done();
        });
        it("it should have fail status", (done) => {
          fakeTape.body.status.should.be.eql("fail");
          done();
        });
        it("it should return an error", (done) => {
          fakeTape.body.data.should.be.a("array");
          fakeTape.body.data[0].should.be.a("object");
          fakeTape.body.data[0].should.have.property("Tape");
          done();
        });
    });

    describe("remove a non existing users review of an existing tape", () => {
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

    describe("remove a non existing users review of a non existing tape", () => {
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
