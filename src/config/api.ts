// API base URL - switches between local and production automatically
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://nomqhelemoyo.pythonanywhere.com/api' // Replace 'yourusername' with your actual PythonAnywhere username
  : 'http://127.0.0.1:8001/api';

export default API_BASE_URL;