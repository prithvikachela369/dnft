import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Nat8 "mo:base/Nat8";
actor class nft(name:Text, owner:Principal,content:[Nat8]) =this{
 //Debug.print("Hello from the NFT actor!");
//In Motoko, an actor class is a blueprint for creating multiple actors that share a common structure and behavior
 private var itemName = name;
 private var nftOwner = owner;
 private var imageBytes = content;

 public query func getName() : async Text {
  Debug.print("getName called");
  return itemName;
 };   

 public query func getOwner() : async Principal {
  Debug.print("getOwner called");
  return nftOwner;
 };

 public query func getContent() : async [Nat8] {
  Debug.print("getContent called");
  Debug.print(debug_show(imageBytes));
  return imageBytes;
 };

 public query func getPrincipal() : async Principal {
  Debug.print("getPrincipal called");
  return Principal.fromActor(this);
 };

 public shared(msg) func transferNFTOwnership(newOwner:Principal) : async Text {
    if(msg.caller != nftOwner) {
      Debug.print("Transfer failed: Caller is not the owner");
      return "Transfer failed: Caller is not the owner";
    }else {
  Debug.print("Transfer ownership initiated by: " # debug_show(msg.caller));
  Debug.print("Current owner: " # debug_show(nftOwner));
  Debug.print("Current NFT Principal: " # debug_show(Principal.fromActor(this)));
  Debug.print("Current NFT Name: " # debug_show(itemName)); 
  Debug.print("transferNFTOwnership called");
  nftOwner := newOwner;
  Debug.print("NFT ownership transferred to: " # debug_show(newOwner));
  return "Ownership transferred";
    }
 };
}