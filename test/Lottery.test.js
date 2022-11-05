const assert = require("assert");
const { lookup } = require("dns");
const ganache = require("ganache-cli"); // local test network
const Web3 = require("web3"); //constructor ;
const web3 = new Web3(ganache.provider()); //ganache testnetprovider

const { interface, bytecode } = require("../compile");

let lottery;

let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });
  it("allows one account to enter", async () => {
    //enter yapildigi zaman emin olmak icin test yaziyoruz
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"), // convert ettik --- 10000000000 yazmamak icin
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });
  it("allows multiple accounts to enter", async () => {
    //enter yapildigi zaman emin olmak icin test yaziyoruz
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"), // convert ettik --- 10000000000 yazmamak icin
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"), // convert ettik --- 10000000000 yazmamak icin
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"), // convert ettik --- 10000000000 yazmamak icin
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });
  it("requires a minimim amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0", "ether"), // minimum degeri saglamadigimiz icin testi gecti
      });
      assert(false); //
    } catch (error) {
      assert(error);
    }
  });
  it("only manager can call pickWinner ", async () => {
    try {
      await lottery.methods.pickWinner().send({
        // hangi accountsdan geldigini kontrol ettik
        from: accounts[1],
      });
      assert(false); ///otomatik false yapiyor kosullar ne olursa olsun
    } catch (error) {
      assert(error);
    }
  });

  it("sends money to the winner and resets the players array", async () => {
    try {
      await lottery.methods.enter.send({
        from: accounts[0],
        value: web3.utils.toWei("2", "ether"),
      });
      const initialBalance = await web3.eth.getBalance(accounts[0]);
      await lottery.methods.pickWinner().send({ from: accounts[0] });
      const finalBalance = await web3.eth.getBalance(accounts[0]);
      const difference = finalBalance - initialBalance;
      console.log(finalBalance - initialBalance);
      assert(difference > web3.utils.toWei("1.8", "ether"));
    } catch (error) {
      assert(error);
    }
  });
});
