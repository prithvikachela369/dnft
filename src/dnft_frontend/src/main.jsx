import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../src/components/App';
import './index.scss';
import { Principal } from "@dfinity/principal";

const CURRENT_USER = Principal.fromText("2vxsx-fae");
export default CURRENT_USER;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
