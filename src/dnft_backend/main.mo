import Principal "mo:base/Principal";
import NFtActorClass "./NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor OpenD{

private type Listing = {
    itemOwer: Principal;
    itemPrice: Nat;
};
var mapOfNFT = HashMap.HashMap<Principal,NFtActorClass.nft>(1,Principal.equal,Principal.hash);
var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
var mapOfListedNFT = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    public shared(msg) func mint(imgData:[Nat8], name:Text): async Principal{
        let owner:Principal = msg.caller;

        Debug.print("Minting NFT for owner: " # debug_show(owner));

        Debug.print(debug_show(Cycles.balance()));

        // Add cycles before creating the NFT actor
        Cycles.add(1_000_000_000_000);// add 1 trillion cycles (1 Tera cycle) for new canister
        let newNFT = await NFtActorClass.nft(name, owner, imgData);
        
        Debug.print(debug_show(Cycles.balance()));

        let newNFTPrincipal = await newNFT.getPrincipal();

        mapOfNFT.put(newNFTPrincipal, newNFT);

        addToOwnerShipMap(owner, newNFTPrincipal);
        Debug.print("NFT minted successfully for owner: " # debug_show(owner));
        Debug.print("NFT Name: " # debug_show(await newNFT.getName()));

        Debug.print("NFT Content: " # debug_show(await newNFT.getContent()));
        Debug.print("NFT Owner: " # debug_show(await newNFT.getOwner()));
        Debug.print("NFT Principal: " # debug_show(newNFTPrincipal));
        

        return newNFTPrincipal;
    };

private func addToOwnerShipMap(owner:Principal, nftId:Principal){
    Debug.print("Before: " # debug_show(mapOfOwners.get(owner)));
    
    var ownedNFTs:List.List<Principal> = switch(mapOfOwners.get(owner)){
        case null {
            Debug.print("Owner is new, creating empty list");
            List.nil<Principal>();
        };
        case(?result) {
            Debug.print("Owner exists, current NFTs: " # debug_show(List.size(result)));
            result;
        };
    };
    
    ownedNFTs := List.push(nftId,ownedNFTs);
    mapOfOwners.put(owner,ownedNFTs);
    
    Debug.print("After: " # debug_show(mapOfOwners.get(owner)));
};

    public query func getOwnedNFTs(user:Principal): async [Principal]{
       var userNFTs:List.List<Principal> = switch(mapOfOwners.get(user)){
            case null List.nil<Principal>();
            case(?result) result;
        };
        Debug.print(debug_show(userNFTs));
        return List.toArray(userNFTs);
    };

    // FIXED: Check if the caller is the original owner from mapOfOwners instead of current NFT owner
    public shared(msg) func listNFT(id:Principal, price:Nat):async Text {
        Debug.print("Attempting to list NFT with ID: " # debug_show(id) # " and price: " # debug_show(price));
        Debug.print("Caller: " # debug_show(msg.caller));
        
        var item:NFtActorClass.nft = switch(mapOfNFT.get(id)){
            case null {
                Debug.print("NFT not found for ID: " # debug_show(id));
                return "NFT not found";
            };
            case(?result) result;
        };

        // Check if the caller is the original owner by checking the ownership map
        let userNFTs = switch(mapOfOwners.get(msg.caller)){
            case null {
                Debug.print("Caller has no NFTs");
                return "You don't own any NFTs";
            };
            case(?result) result;
        };

        // Check if the NFT ID exists in the caller's owned NFTs
        let ownsNFT = List.some(userNFTs, func(nftId: Principal) : Bool {
            Principal.equal(nftId, id)
        });

        if (not ownsNFT) {
            Debug.print("Caller does not own this NFT");
            return "You are not the owner of this NFT";
        };

        // Create the listing
        let newListing:Listing = {
            itemOwer = msg.caller; // Store the original owner, not the current NFT owner
            itemPrice = price;
        };
        
        mapOfListedNFT.put(id, newListing);
        Debug.print("NFT listed successfully with ID: " # debug_show(id) # " and price: " # debug_show(price));
        return "NFT listed successfully";
    };

    public query func getOpenDPrincipalID() : async Principal {
        return Principal.fromActor(OpenD);
    };

    public query func isListed(id:Principal):async Bool{
        if(mapOfListedNFT.get(id) == null){
            return false;
        }else{
            return true;
        };
    };

    public query func getListedNFTs():async [Principal]{
        let ids = Iter.toArray(mapOfListedNFT.keys());
        return ids;
    };

    public query func getOriginalOwner(id:Principal):async Principal{
        let listing = switch(mapOfListedNFT.get(id)){
            case null {
                Debug.print("NFT not listed for ID: " # debug_show(id));
                return Principal.fromText("2vxsx-4iaaa-aaaaa-aaaaa-cai"); // Default principal if not listed
            };
            case(?result) result;
        };
        return listing.itemOwer;
    };

    public query func getListedNFTPrice(id:Principal):async Nat{
        Debug.print("Getting price for NFT ID: " # debug_show(id));
        var listingPrice = switch(mapOfListedNFT.get(id)){
            case null{
                Debug.print("NFT not found in listings, returning 0");
                return 0;
            };
            case(?result) {
                Debug.print("Found listing with price: " # debug_show(result.itemPrice));
                result;
            };
        };
        return listingPrice.itemPrice;
    };

    public shared(msg) func transfer(id:Principal, ownerId:Principal, newOwnerId:Principal): async Text {
        var purchasedNFT:NFtActorClass.nft = switch(mapOfNFT.get(id)){
            case null {
                Debug.print("NFT not found for ID: " # debug_show(id));
                return "NFT not found";
            };
            case(?result) result;

        };

        let transferOwnershipResult = await purchasedNFT.transferNFTOwnership(newOwnerId);
        Debug.print("Transfer ownership result: " # debug_show(transferOwnershipResult));
        if (transferOwnershipResult != "Ownership transferred") {
            Debug.print("Transfer failed: " # debug_show(transferOwnershipResult));
            return transferOwnershipResult;
        }else{
            mapOfListedNFT.delete(id);
            var ownedNFTs:List.List<Principal> = switch(mapOfOwners.get(ownerId)){
                case null {
                    Debug.print("Owner has no NFTs, creating new list");
                    List.nil<Principal>();
                };
                case(?result) result;
            };
ownedNFTs := List.filter(ownedNFTs,func(listItemid:Principal):Bool{
    return listItemid != id;
});
             addToOwnerShipMap(newOwnerId, id);
             Debug.print("NFT ownership transferred and removed from listings");
                     return "Success";
        };
    };
};