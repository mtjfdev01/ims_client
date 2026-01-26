import React from 'react';
import Navigation from '../components/Navigation';
import './Home.css';

const Home = () => {
  return (
    <div>
      <Navigation />
      <div className="home-container">
        <h1>Welcome to Inventory Management System</h1>
        <p>You have successfully logged in!</p>
      </div>
    </div>
  );
};

export default Home;

