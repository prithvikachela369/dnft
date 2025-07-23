import { useEffect, useState } from "react";
import React from "react";
import Item from "./Item";


function Gallery(props) {

const [items, setItems] = React.useState([]);

function fetchNFTs(){
  console.log("Fetching NFTs for user:", props.nftIDs);
  if(props.nftIDs != undefined){
setItems(
  props.nftIDs.map((id) => (
    <Item id={id}  key={id.toString()} role={props.role}/>
  ))
);
console.log(items)
  }else{
    console.log("No NFTs found for the user.");
  }
}

useEffect(() => {fetchNFTs()}, []);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
           {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
