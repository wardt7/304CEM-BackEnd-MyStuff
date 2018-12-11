# 304CEM-Back-MyStuff
The back-end API to be used for the MyStuff website

# Troubleshooting the Back-End
## Issues with the database - website
- The SQL database is currently hosted on FreeMySQLHosting.
- However, this frequently goes down due to account expirations, etc.
- To solve, replace the data in the databaseData object (L33-36) with
your own database URL, database name, username and password
- To setup the tables, you'll need access to a REST client (e.g. postman)
- Send a GET request to the /createTables route; you will need to
set the Authorization header to an admin-power JSON Web Token
- To obtain the token, run > node adminToken.js
- After this, the website should work, although you will need to upload
your own products and users. The only user in the system at initialization
is "admin", with username "password"

## Issues with the database - Unit Tests
- The Unit Test database is separate to the production one
- Replace each databaseData object with your new details
- You don't have to send any GET requests, as each test will set up the
database for you.