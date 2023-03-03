# WEBSHOP API

This is my solution for the webshop API. It is deployed to https://webshop.csornyei.com/ 

I used Express, Typescript and Prisma to create the API. For database I choose CockroachDB as this is built on top of Postgres and have generous free tier.
The app is deployed to Google Cloud Run with the Dockerfile in the root of the project.

To run the project locally you need Docker (change the DB_URL in the command to your own database):

``` bash
docker build -t webshop-api --build-arg DB_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public" .
docker run -p 3000:3000 -e PORT=3000 webshop-api
```

## API

### GET /api/products
Listing the products in the database. 
Accept a limit and offset query parameters. The limit is by default 20. 
Accept a `q` query parameter to search for products by name.

### GET /api/products/:id
Get a single product by id.

### POST /api/auth/register
Register a new user. The body should be a JSON object with `email`, `password` and `passwordConfirmation` fields.
Returns a JWT token.

### POST /api/auth/login
Login a user. The body should be a JSON object with `email` and `password` fields.
Returns a JWT token.

### POST /api/orders
Requires authentication. For this send `Authorization` header with `Bearer <JWT Token>`
Create a new order. The body should be a JSON object with an `items` array of product ids and quantities.

### GET /api/orders/:id
Requires authentication. For this send `Authorization` header with `Bearer <JWT Token>`
Get a single order by id.

### PATCH /api/orders/:id
Requires authentication. For this send `Authorization` header with `Bearer <JWT Token>`
Update an order. The body should be a JSON object with an `items` array of product ids and quantities. To remove and item from the order, set the quantity to 0.

### DELETE /api/orders/:id
Requires authentication. For this send `Authorization` header with `Bearer <JWT Token>`
Cancel an order.

### POST /api/orders/:id/checkout
Requires authentication. For this send `Authorization` header with `Bearer <JWT Token>`
Checkout an order. This will set the order status to `SENT`

## TESTING

As the application does not have too complex logic in it the tests are created are more meant to be E2E tests. I used Jest and Supertest to create the tests.
The main tests can be found in the `src/routes/__test__` folder.
