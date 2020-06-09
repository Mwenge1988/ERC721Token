// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.7.0;
// pragma experimental ABIEncoderV2;
import "./ERC721Contract.sol";


contract SadcCoin is ERC721Contract {
    address admin;
    uint256 sadccoinId;

    struct SadccoinGrain {
        uint256 id;
        string name;
        uint256 tonnes;
        uint256 moisturecontent;
    }
    uint256[] Id;
    mapping(uint256 => SadccoinGrain) public sadccoin;
    mapping(uint256 => address) public idToOwner;

    // mapping(uint256 => Id[]) public idToGrain;

    constructor() public {
        admin = msg.sender;
        //giving token 0 to owner;
        SadccoinGrain memory grain = SadccoinGrain(sadccoinId, "Maize", 100, 100);
        sadccoin [sadccoinId] = grain;
        Id.push(sadccoinId);
        mint(admin, sadccoinId);
        idToOwner[sadccoinId] = admin;
        sadccoinId++;
    }

    function createSadccoin(
        string calldata _name,
        uint256 _tonnes,
        uint256 _moisturecontent
    ) external {
        require(_tonnes > 1000, "Sadccoin: The tonnage should be >1000.");
        require(_moisturecontent < 14, "Sadccoin: The moisure content should be < 14.");
        sadccoin[sadccoinId] = SadccoinGrain(sadccoinId, _name, _tonnes, _moisturecontent);
        Id.push(sadccoinId);
        mint(msg.sender, sadccoinId);
        idToOwner[sadccoinId] = msg.sender;
        sadccoinId++;
    }

    function sendSadccoin(uint256 _tokenId, address _to) external {
        //check user is sending his own token
        address oldOwner = idToOwner[_tokenId];
        require(msg.sender == oldOwner, "Sadccoin: Not Authorized to send.");
        _safeTransfer(oldOwner, _to, _tokenId, "");
        idToOwner[_tokenId] = _to;
    }

    function getGrainsId() public view returns (uint256[] memory) {
        return Id;
    }

    function getSingleGrain(uint256 _sadccoinId)
        public
        view
        returns (
            string memory,
            uint256,
            uint256
        )
    {
        return (
            sadccoin[_sadccoinId].name,
            sadccoin[_sadccoinId].tonnes,
            sadccoin[_sadccoinId].moisturecontent
        );
    }


}
