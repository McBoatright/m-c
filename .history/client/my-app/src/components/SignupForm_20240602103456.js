import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('/signup', { username, password, email })
      .then(response => {
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
        axios.post('/login', { username, password })
          .then(loginResponse => {
            localStorage.setItem('token', loginResponse.data.token);
            navigate('/calendar');
          })
          .catch(error => {
            if (error.response) {
              setErrorMessage(error.response.data);
            } else {
              console.log('Error', error.message);
            }
          });
      })
      .catch(error => {
        if (error.response) {
          setErrorMessage(error.response.data);
        } else {
          console.log('Error', error.message);
        }
      });
  };

  return (
    <div>
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <input type="submit" value="Sign Up" />
      </form>
      <p style={{fontSize: '0.8em', marginTop: '10px'}}>Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.</p>
    </div>
  );
}

export default SignupForm;