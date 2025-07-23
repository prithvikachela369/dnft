import React, { useEffect } from "react";
import logo from "../../public/logo.png";
import { BrowserRouter,Link,Routes,Route} from "react-router-dom";
import homeImage from "../../public/home-img.png";
import Minter from "./Minter";
import CURRENT_USER from "../main";
import Gallery from "./Gallery";
import { dnft_backend } from "../../../declarations/dnft_backend"; 




function Header() {


  //const [userOwnedGallery, setUserOwnedGallery] = React.useState([]);
  const[userOwnedCollection,setUserOwnedCollection] = React.useState([]);
  const [listingGallery, setListingGallery] = React.useState([]);

  async function getNFTs(){
    const UserNFTids = await dnft_backend.getOwnedNFTs(CURRENT_USER);
    console.log("NFTs fetched for user:", CURRENT_USER.toText());
    console.log("User NFT IDs:", UserNFTids);
    setUserOwnedCollection(UserNFTids);

    const listedNFT = await dnft_backend.getListedNFTs();
    console.log("Listed NFTs:", listedNFT);
    setListingGallery(listedNFT);
  }

  useEffect(() => {
    getNFTs();
  }, []);

  const CollectionPage = () => {
    return (
        <Gallery title="My NFTs" nftIDs={userOwnedCollection}  role ="userCollection"/>
    );
  }

  return (
    <BrowserRouter>
 
    <div className="app-root-1">
      <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
        <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
          <div className="header-left-4"></div>
          <img className="header-logo-11" src={logo} />
          <div className="header-vertical-9"></div>
        <Link to="/">
          <h5 className="Typography-root header-logo-text">OpenD</h5>
        </Link>
        
          <div className="header-empty-6"></div>
          <div className="header-space-8"></div>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
            <Link to="/discover">Discover</Link>           
          </button>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
            <Link to="/minter">Minter</Link>
            
          </button>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
            <Link to="/collection">My NFTs</Link>
            
          </button>
        </div>
      </header>
    </div>
    <Routes>
     
       <Route path="/discover" element={

        <Gallery title="Discover" nftIDs={listingGallery} role ="discoveryCollection"/>
}>
       </Route>
        <Route path="/minter" element={
        <Minter/>
        }>

        </Route>
         <Route path="/collection" element={
          
          <div>
            <CollectionPage  />
           
           </div>
         } >
         
         </Route>

          <Route path="/" element={
  <img className="bottom-space"src={homeImage} />
          }>
          
      </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default Header;
