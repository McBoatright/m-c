import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/login', { username, password });
      console.log(response.data);

      // Save the token to localStorage or context or wherever you want to store it
      localStorage.setItem('token', response.data.token);

      // Redirect to the calendar
      navigate('/calendar');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <input type="submit" value="Log In" />
      </form>
      <button onClick={handleSignupRedirect}>Go to Signup</button>
    </div>
  );
}

export default LoginForm;