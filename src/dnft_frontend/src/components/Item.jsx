import React, { useEffect, useState, useRef } from "react";
import logo from "../../public/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { dnft_backend } from "../../../declarations/dnft_backend"; 
import { set } from "react-hook-form";
import CURRENT_USER from "..//main";
import PriceLabel from "./PriceLabel";
import { idlFactory as tokenidlFactory } from "../../../declarations/testToken_backend/testToken_backend.did.js";
import { testToken_backend } from "../../../declarations/testToken_backend";

function Item(props) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState("");
  const [button, setButton] = useState("");
  const [priceText, setPriceText] = useState("");
  const [listedStatus, setListedStatus] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [priceLabel, setPriceLabel] = useState();
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [shouldDisplay, setShouldDisplay] = useState(true);
  const priceInputRef = useRef(null);

  var NFTActor = null;
  const id = props.id;
  const localHost = "http://127.0.0.1:4943/";
  const agent = new HttpAgent({ host: localHost, verifyQuerySignatures: false });
  agent.fetchRootKey();

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getContent();
    const imageContent = new Uint8Array(imageData);
    const imageURL = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );

    setName(name);
    setOwner(owner.toText());
    setImage(imageURL);

    const ifNFTisListed = await dnft_backend.isListed(props.id);

    if (props.role === "userCollection") {
      if (ifNFTisListed) {
        setOwner("OpenD");
        setBlur({ filter: "blur(5px)" });
        setListedStatus(" (Listed)");
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
    } else if (props.role === "discoveryCollection") {
      const originalOwner = await dnft_backend.getOriginalOwner(id);
      if (originalOwner.toText() != CURRENT_USER.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }
      var itemPrice = await dnft_backend.getListedNFTPrice(id);
      itemPrice = itemPrice.toString();
      setPriceLabel(itemPrice);
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  function handlePriceInput(event) {
    const { value } = event.target;
    setPriceText(value);
    console.log("Price input changed:", value);
  }

  function handleSell() {
    setShowPriceInput(true);
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  async function sellItem() {
    const priceValue = priceInputRef.current ? priceInputRef.current.value : priceText;
    const priceNumber = Number(priceValue);
    
    console.log("Price from ref:", priceValue);
    console.log("Price from state:", priceText);
    
    setBlur({ filter: "blur(5px)" });
    setLoaderHidden(false);

    const listingResult = await dnft_backend.listNFT(id, priceNumber);

    if (listingResult == "NFT listed successfully") {
      const openDID = await dnft_backend.getOpenDPrincipalID();
      const transferResult = await NFTActor.transferNFTOwnership(openDID);

      if (transferResult == "Ownership transferred") {
        setLoaderHidden(true);
        setButton();
        setShowPriceInput(false);
        setPriceText("");
        setShouldDisplay(false);
      }
    } else {
      alert(listingResult);
      setLoaderHidden(true);
      setBlur();
      setShowPriceInput(false);
      setPriceText("");
    }
  }

  async function handleBuy() {
    console.log("Buy button clicked for NFT ID:", id);
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenidlFactory, {
      agent,
      canisterId:Principal.fromText("vizcg-th777-77774-qaaea-cai"),
    });
    const sellerId = await dnft_backend.getOriginalOwner(id);
    const price = await dnft_backend.getListedNFTPrice(id);

   const result =  await tokenActor.transfer(sellerId, price);
   console.log("Transfer result:", result);

   if(result == "Success"){
    const transferResult = await dnft_backend.transfer(id,sellerId,CURRENT_USER);
    console.log("Transfer result:", transferResult);
setLoaderHidden(true);
   }
  };
  return (
    <div style = {{display :shouldDisplay ? "inline":"none"}}className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          <PriceLabel sellPrice={priceLabel} />
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text">{listedStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          
          {showPriceInput && (
            <input
              ref={priceInputRef}
              placeholder="Price in DANG"
              type="number"
              className="price-input"
              name="priceInput"
              defaultValue=""
              onChange={handlePriceInput}
            />
          )}

          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;