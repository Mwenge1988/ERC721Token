const { expectRevert } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");
const ERC721Contract = artifacts.require("ERC721Contract");
const BadMockContract = artifacts.require("BadMockContract");
const Sadccoin = artifacts.require("Sadccoin");
const mintingAddress = "0x0000000000000000000000000000000000000000";
contract("ERC721 Contract", (accounts) => {
  let instance;
  const [admin, trader1, trader2] = [accounts[0], accounts[1], accounts[2]];
  before(async () => {
    instance = await ERC721Contract.deployed();
    for (let i = 0; i < 1000; i++) {
      let tx = await instance.mint(admin, i);
    }
  });

  it("test: balanceOf function", async () => {
    const initialTokenSupply = 1000;
    let tx = await instance.balanceOf.call(admin);
    assert(
      new BigNumber(tx).isEqualTo(new BigNumber(initialTokenSupply)),
      "This is not expected supply"
    );
  });

  it("test: ownerOf function", async () => {
    const tokenId = 0;
    const addressExpected = admin;
    const tx = await instance.ownerOf.call(tokenId);
    assert(tx === addressExpected, "This is not expected owner");
  });

  it("test: getApproved function", async () => {
    const tokenId = 0;
    
    const addressExpected = "0x0000000000000000000000000000000000000000";
    let tx = await instance.getApproved.call(tokenId);
    assert(tx === addressExpected, "This is not expected approving token Id");
  });

  it("test: transferFrom() should transfer", async () => {
    const tokenId = 0;
    const adminBalanceBefore = await instance.balanceOf.call(admin);
    // const trader1BalanceBefore = await instance.balanceOf.call(trader1);

    const receipt = await instance.transferFrom(admin, trader1, tokenId, {
      from: admin,
    });

    const [adminBalance, trader1Balance, owner] = await Promise.all([
      instance.balanceOf(admin),
      instance.balanceOf(trader1),
      instance.ownerOf(tokenId),
    ]);

    assert(
      new BigNumber(adminBalanceBefore)
        .minus(new BigNumber(adminBalance))
        .isEqualTo(new BigNumber(trader1Balance)),
      "This is not expected supply"
    );
    assert(owner === trader1, "This is not expected owner");

    //emit event Transfer
    truffleAssert.eventEmitted(receipt, "Transfer", (obj) => {
      return (
        obj._from === admin &&
        obj._to === trader1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  //check the call to ERC721Receiver contract is made or not

  it("test: safetransferFrom() should transfer", async () => {
    const tokenId = 1;
    const adminBalanceBefore = await instance.balanceOf.call(admin);
    // const trader1BalanceBefore = await instance.balanceOf.call(trader1);
    // const receipt1 = await instance.approve(admin, tokenId, { from: admin });
    // console.log(receipt1);
    const receipt = await instance.transferFrom(admin, trader1, tokenId, {
      from: admin,
    });

    const [adminBalance, trader1Balance, owner] = await Promise.all([
      instance.balanceOf(admin),
      instance.balanceOf(trader1),
      instance.ownerOf(tokenId),
    ]);

    assert(adminBalance.toNumber() === 1, "This is not expected supply");
    assert(owner === trader1, "This is not expected owner");

    //emit event Transfer
    truffleAssert.eventEmitted(receipt, "Transfer", (obj) => {
      return (
        obj._from === admin &&
        obj._to === trader1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  //check what happends if contract is implementing ERC721Receiver
  it("safeTransferFrom should not transfer if receipent does not implement erc721receiver", async () => {
    const badRecipient = await BadMockContract.new();
    await expectRevert(
      instance.safeTransferFrom(trader1, badRecipient.address, 0, {
        from: trader1,
      }),
      "revert"
    );
  });
  it("should transfer when approved", async () => {
    const tokenId = 2;
    const trader1BalanceBefore = await instance.balanceOf.call(trader1);
    const receipt1 = await instance.approve(trader1, tokenId, { from: admin });

    const approvedReceipt = await instance.getApproved(tokenId);
    const receipt2 = await instance.transferFrom(trader1, trader2, tokenId, {
      from: trader1,
    });

    const [adminBalance, trader1Balance, owner] = await Promise.all([
      instance.balanceOf(trader1),
      instance.balanceOf(trader2),
      instance.ownerOf(tokenId),
    ]);

    assert(
      new BigNumber(trader1BalanceBefore)
        .minus(new BigNumber(adminBalance))
        .isEqualTo(new BigNumber(trader1Balance)),
      "This is not expected supply"
    );
    assert(owner === trader2, "This is not expected owner");

    //emit event Transfer
    truffleAssert.eventEmitted(receipt1, "Approval", (obj) => {
      return (
        obj._owner === admin &&
        obj._approved === trader1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  it("test setApprovalForAll function", async () => {
    const receipt = await instance.setApprovalForAll(admin, true, {
      from: trader1,
    });

    truffleAssert.eventEmitted(receipt, "ApprovalForAll", (obj) => {
      return (
        obj._owner === trader1 &&
        obj._operator === admin &&
        obj._approved === true
      );
    });
    const receipt2 = await instance.isApprovedForAll.call(trader1, admin);

    assert(receipt2 === true, "This is not expected approved output");
  });
});

contract("Sadccoin", (accounts) => {
  let sadccoinInstance;
  const [admin, trader1, trader2] = [accounts[0], accounts[1], accounts[2]];
  //first sadccoin created by the admin
  const firstSadccoinName = "Maize";
  const firstSadccoinTonnes = new BigNumber(1000);
  const firstSadccoinMoisturecontent = new BigNumber(14);

  before(async () => {
    sadccoinInstance = await Sadccoin.deployed();
  });

  it("Check pre-created Sadccoin grain 'Maize'", async () => {
    const tokenId = 0;
    const receipt = await sadccoinInstance.sadccoin(tokenId);

    assert(
      receipt.name === firstSadccoinName,
      "This is not expected Sadccoin Name"
    );

    assert(
      new BigNumber(receipt.tonnes).isEqualTo(firstSadccoinTonnes),
      "This is not expected Grain Tonnage"
    );
    assert(
      new BigNumber(receipt.moisturecontent).isEqualTo(firstSadccoinMoisturecontent),
      "This is not expected Grain Moisture Content"
    );
  });

  it("should return the right owner", async () => {
    const tokenId = 0;
    const receipt = await sadccoinInstance.idToOwner(tokenId);
    assert(receipt === admin);
  });

  it("should create a desired sadccoin", async () => {
    const name = "Wheat";
    const tonnes = 1001;
    const moisturecontent = 13;
    const sadccoinId = 1;
    const grainReceipt = await sadccoinInstance.createSadccoin(
      name,
      tonnes,
      moisturecontent,
      { from: trader1 }
    );

    const mintedTx = await sadccoinInstance.mint(trader1, sadccoinId);
    truffleAssert.eventEmitted(mintedTx, "Transfer", (obj) => {
      return (
        obj._from === mintingAddress &&
        obj._to === trader1 &&
        new BigNumber(obj._tokenId).isEqualTo(new BigNumber(sadccoinId))
      );
    });
    assert(
      grainReceipt,
      name,
      tonnes,
      moisturecontent,
      "This is not expected information"
    );
    const receipt = await sadccoinInstance.idToOwner(sadccoinId);

    assert(receipt === trader1, "This is not expected owner");
  });

  it("Should the return array of ids", async () => {
    let receipt = await sadccoinInstance.getGrainsId.call();

    assert(
      new BigNumber(receipt[0]).isEqualTo(new BigNumber(0)),
      "This is not expected Id: 0"
    );
    assert(
      new BigNumber(receipt[1]).isEqualTo(new BigNumber(1)),
      "This is not expected Id: 1"
    );
  });

  it("get the singlecard using id", async () => {
    const tokendId = 1;
    let receipt = await sadccoinInstance.getSingleGrain.call(tokendId);

    assert(receipt[0] === "Wheat", "This is not expected name");
    assert(
      new BigNumber(receipt[1]).isEqualTo(new BigNumber(1001)),
      "This is not expected Sadccoin Tonnage"
    );
    assert(
      new BigNumber(receipt[2]).isEqualTo(new BigNumber(12)),
      "This is not expected Sadccoin Moisture Content"
    );
  });
});