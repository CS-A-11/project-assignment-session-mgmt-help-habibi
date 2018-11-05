## To run the project:
Use the following commands

`npm install`
`DEBUG=helphabibi:* npm start`# project-assignment-session-mgmt-help-habibi


Project Group Members:
Tahir Hameed Roll No. L154089
Hamza Awais Roll No. l154089

About help-habibi:
Help Habibi is a company which ensures student’s progress in their academic and professional careers by providing assistance in assignments, quizzes, thesis, dissertations, exams and online courses. We have experienced assignment helpers on our panel who ensure that our students make the most out of their academic career.

Homepage: https://help-habibi.herokuapp.com



UseCases:
User can login. http://localhost:5000/client/register
User can signup.  http://localhost:5000/client/login
User can view previous orders and orders in progress. http://localhost:5000/client/client-dashboard
User can upload new order. http://localhost:5000/client/order
User can chat with admin. http://localhost:5000/client/chat/5be03e5372fb2b1cb63f4268
Client can view previous work done by admin.  http://localhost:5000/proves


Schema:
Account,
Message ,
Order,
Proof

Contribution:

Tahir Hameed:

Wrote the code for front-end and models.
Designed and coded the views
Implemented front-end input form validations for all the views
Designed the schema for Account and Message
Implemented usecases 1,2 and 6

Hamza Awais:
Wrote the code for back-end.
Wrote the code for back-end error and exception handling for all use cases.
Implemented Use cases 3,4,5
Designed the schema for Order and proof.




