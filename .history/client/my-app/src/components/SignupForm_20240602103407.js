import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom'; 

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const [meals, setMeals] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formName, setFormName] = useState('');

  const navigate = useNavigate(); 

  const logout = () => { 
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchMeals = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/meals', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const mealsWithDateObjects = response.data.map(meal => ({
        ...meal,
        start: new Date(meal.start),
        end: new Date(meal.end),
      }));
      setMeals(mealsWithDateObjects);
    })
    .catch(error => {
      console.error('Error fetching data', error);
    });
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const addMeal = (meal) => {
    if (!meal.name || !meal.start || !meal.end) {
      console.error('All fields are required');
      return;
    }
  
    const newMeal = {
      ...meal,
      start: new Date(meal.start).toISOString(),
      end: new Date(meal.end).toISOString(),
    };
  
    const token = localStorage.getItem('token');
  
    axios.post('http://localhost:3000/meals', newMeal, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('Meal added successfully', response.data);
      fetchMeals(); // Fetch meals again to update the list
    })
    .catch(error => {
      console.error('Error adding meal', error);
    });
  };

  const handleSelectSlot = (slotInfo) => {
    setFormStart(moment(slotInfo.start).format('YYYY-MM-DDTHH:mm'));
    setFormEnd(moment(slotInfo.end).format('YYYY-MM-DDTHH:mm'));
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMeal = {
      start: formStart,
      end: formEnd,
      name: formName,
    };

    addMeal(newMeal);
    setIsOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Meal Calendar</h1>
      <button onClick={logout}>Logout</button> {}
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            placeholder="Meal name"
          />
          <input
            type="datetime-local"
            value={formStart}
            onChange={(e) => setFormStart(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            value={formEnd}
            onChange={(e) => setFormEnd(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </Modal>
      <BigCalendar
        localizer={localizer}
        events={meals}
        titleAccessor="name"
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        defaultView='week'
        views={['week', 'day', 'agenda']}
        style={{height: "800px", width: "100%"}}
      />
    </div>
  );
}

export default Calendar;