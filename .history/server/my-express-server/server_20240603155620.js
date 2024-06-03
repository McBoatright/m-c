// External module imports
import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import pkg from 'pg';
import { hash as _hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

// Module configurations
dotenv.config();

// Constants
const { Client } = pkg;
const { verify, sign } = jwt;
const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

// Added a new comment
// This is a new comment to make a minor change in the code

if (!process.env.JWT_SECRET || !process.env.POSTGRES_PASSWORD) {
  throw new Error('Missing necessary environment variables');
}
 
 function verifyToken(req, res, next) {
   const bearerHeader = req.headers['authorization'];
 
   if (typeof bearerHeader !== 'undefined') {
     const bearer = bearerHeader.split(' ');
     const bearerToken = bearer[1];
     verify(bearerToken, process.env.JWT_SECRET, (err, data) => {
       if (err) {
         res.sendStatus(403);
       } else {
         req.userData = data;
         next();
       }
     });
   } else {
     res.sendStatus(403);
   }
 }
 app.use(cors({ origin: 'http://localhost:3001' }));
 
 app.use(json());
 
const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')).required()
  });
  
  app.post('/signup', (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
      let errorMessage = error.details[0].message;
      if (error.details[0].path[0] === 'password') {
        errorMessage += ' Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.';
      }
      return res.status(400).send(errorMessage);
    }
  
    createUser(req.body.username, req.body.email, req.body.password, res);
  });
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.DB_NAME
  });
  
  function createUser(username, email, password, res) {
    _hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password', err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hash])
        .then(() => res.json({ message: 'User created successfully' }))
 
     client.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hash])
       .then(() => res.json({ message: 'User created successfully' }))
       .catch(err => {
         console.error('Error executing query', err.stack);
         res.status(500).json({ message: 'Server error' });
       });
   });
 }
 
 app.post('/signup', (req, res) => {
   console.log(req.body); // Log the request body, remove this line later
   const { username, email, password } = req.body;
 
   if (!username || !email || !password) {
     return res.status(400).json({ message: 'Username, email and password are required' });
   }
   console.log('Checking if user exists:', username); // remove this line later
 
   // Check if a user with the provided username already exists
   client.query('SELECT * FROM users WHERE username = $1', [username])
     .then(results => {
       console.log('User exists:', results.rows.length > 0); // remove this line later
       if (results.rows.length > 0) {
         // If a user with the provided username already exists, send an error message
         return res.status(400).json({ message: 'Username already exists' });
       } else {
         // If no user with the provided username exists, create a new user
         createUser(username, email, password, res);
       }
     })
     .catch(err => {
       console.error('Error executing query', err.stack);
       res.status(500).json({ message: 'Server error' });
     });
 });
 
 app.post('/login', (req, res) => {
   const { username, password } = req.body;
 
   if (!username || !password) {
     return res.status(400).json({ message: 'Username and password are required' });
   }
 
   client.query('SELECT * FROM users WHERE username = $1', [username])
     .then(results => {
       if (results.rows.length > 0) {
         const user = results.rows[0];
 
         compare(password, user.password, (err, isMatch) => {
           if (err) {
             console.error('Error comparing passwords', err);
             return res.status(500).json({ message: 'Server error' });
           }
 
           if (isMatch) {
             const token = sign({ username: user.username, userid: user.id }, process.env.JWT_SECRET);
             return res.json({ message: 'Login successful', token });
           } else {
             return res.status(401).json({ message: 'Invalid username or password' });
           }
         });
       } else {
         return res.status(401).json({ message: 'Invalid username or password' });
       }
     })
     .catch(err => {
       console.error('Error executing query', err.stack);
       res.status(500).json({ message: 'Server error', error: err.stack });
     });
 });
 
 client.connect()
   .then(() => {
     console.log('Connected to PostgreSQL');
     return client.query('SELECT NOW()');
   })
   .then(result => console.log(result.rows))
   .then(() => {
     return client.query(`
       SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE  table_schema = 'public'
         AND    table_name   = 'meals'
       );
     `);
   })
   .then(result => console.log('Does the meals table exist?', result.rows[0].exists))
   .catch(err => console.error('Connection error', err.stack));
 
 const server = app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
 });
 
 process.on('SIGTERM', () => {
   console.info('SIGTERM signal received.');
   console.log('Closing http server.');
   server.close(() => {
     console.log('Http server closed.');
     client.end();
   });
 });
 
 
 // ... rest of the code

// CREATE
app.post('/meals', verifyToken, (req, res) => {
  const newMeal = req.body;
  const userid = req.userData.userid; // Get userid from token

  if (!newMeal.name || !newMeal.start || !newMeal.end) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  client.query('INSERT INTO meals (name, "start", "end", "userid") VALUES ($1, $2, $3, $4)', [newMeal.name, newMeal.start, newMeal.end, userid])
    .then(() => res.json({ message: 'Meal created successfully' }))
    .catch(err => console.error('Error executing query', err.stack));
});

// READ
app.get('/meals', verifyToken, (req, res) => {
  const userid = req.userData.userid; // Get userid from token

  client.query('SELECT * FROM meals WHERE "userid" = $1', [userid])
    .then(result => {
      console.log('Retrieved meals:', result.rows); // Log the retrieved meals
      res.json(result.rows);
    })
    .catch(err => console.error('Error executing query', err.stack));
});

// ... rest of the code
 
 app.get('/meals/:id', verifyToken, (req, res) => {
   const id = req.params.id;
   client.query('SELECT * FROM meals WHERE id = $1', [id])
     .then(result => res.json(result.rows[0]))
     .catch(err => console.error('Error executing query', err.stack));
 });
 
 // UPDATE
 app.put('/meals/:id', verifyToken, (req, res) => {
   const id = req.params.id;
   const updatedMeal = req.body;
   client.query('UPDATE meals SET name = $1, "start" = $2, "end" = $3 WHERE id = $4', [updatedMeal.name, updatedMeal.start, updatedMeal.end, id])
     .then(() => res.json({ message: 'Meal updated successfully' }))
     .catch(err => console.error('Error executing query', err.stack));
 });
 
 // DELETE
 app.delete('/meals/:id', verifyToken, (req, res) => {
   const id = req.params.id;
   client.query('DELETE FROM meals WHERE id = $1', [id])
     .then(() => res.json({ message: 'Meal deleted successfully' }))
     .catch(err => console.error('Error executing query', err.stack));
 });
 
 
