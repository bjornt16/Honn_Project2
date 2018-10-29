# Honn_Project2

To install the server, open in terminal or bash and use the command "npm install".
After that to run the tests use the command "npm test".
And to run the server it'self use the command "node index".
(Cannot be done at the same time, both use the same port.)

The server uses a self-signed certificate, if you're using Postman you need to turn off "SSL Certificate Verification"

We moved all loan logic to it's own class "LoanService".
This was both for consistancy and to be in more with the ReviewService class.

Due to this some of the api was changed.
And in some cases improved.

GET /users?{userId} and /tapes?{tapeId} both now also accept the query strings
Loans=true and Reviews=true. This gives better modularity to these Api.
Loans=true works with the LoanDuration and LoanDate queries.

LoanDuration and LoanDate queries work with all GET requests, except review routes. (no loan returns)

Our system supports borrowing the same tape multiple times, although not at the same time.
So PUT /users/{user_id}/tapes/{tape_id} defaults to latest loan.
And PUT /loans/{loanId} can be used to alter a specific loan record.

GET /loans - returns a list of all loan records.
GET /loans/{loanId} - returns a specific loan record.
GET /users/{user_id}/loans - returns a specific user's loan records.
GET /tapes/{tape_id}/loans - returns a specifc tape's loan records.
GET /users/{user_id}/tapes/{tape_id}/loans - return a specific user's loan records for a specific tape
GET /tapes/{tape_id}/users/{user_id}/loans - return a specific tapes's loan records for a specific user

When you Create Update or Delete.
The new/modified/deleted content is returned.
When you delete a user, the user is returned in the delete along with his reviws and loans.