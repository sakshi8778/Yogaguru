const express = require('express');
 const cors = require('cors');
  require('dotenv').config();
  
  const app = express();
   const PORT = process.env.PORT || 5000;
   
   app.use(cors());
    app.use(express.json());
    
    app.get('/', (req, res) => {
    res.send('Welcome to the YogaGuru Backend API! Head over to /api/health to check status.');
    });
    app.listen(PORT, () => { 
     console.log(`Server running on http://localhost:${PORT}`);
     });












