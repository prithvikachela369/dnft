import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";

import Item from "./Item";
import Minter from "./Minter";

function App() {
  const NFTID = "uxrrr-q7777-77774-qaaaq-cai";
  return (
    <div className="App">
      <Header />
      {/* <Minter/> */}
    {/* <Item id= {NFTID}/> */}

      <Footer />
    </div>
  );
}

export default App;
