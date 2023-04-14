const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

    const ID =1;
    const NAME = "Shoes"
    const CATEGORY = "Clothing"
    const IMAGE = "https://images.vans.com/is/image/VansEU/VN0A3WMAVNE-HERO?$PDP-FULL-IMAGE$"
    const COST = tokens(1)
    const RATING =4
    const STOCK = 5;
describe("Dappazon", () => {
  let dappazon;
  let deployer,buyer
  //created hook
  beforeEach(async ()=>{
    //setup accounts
    [deployer ,buyer] = await ethers.getSigners()
    //console.log(await ethers.getSigners())
  
    //deploy contract
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  })

  describe("Listing",()=>{
    let transaction;

    
    beforeEach(async ()=>{
      transaction = await dappazon.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait();
    })
    it('Returns item attribute',async ()=>{
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
      
    })
    it('Emits list',()=>{
      expect(transaction).to.emit(dappazon,"List");
    })

  })

  describe("Buying",()=>{
    let transaction;

    
    beforeEach(async ()=>{
      //list an item
      transaction = await dappazon.connect(deployer).list(ID,NAME,CATEGORY,IMAGE,COST, RATING,STOCK);
       await transaction.wait();
      //buy an item
      transaction = await dappazon.connect(buyer).buy(ID,{value:COST})
      
    })
   
    it("Updates the contract balance",async ()=>{
      const result = await ethers.provider.getBalance(dappazon.address)
      //console.log(result)
      expect(result).to.equal(COST)
    })
    it("Updates buyers order count",async ()=>{
      const result = await dappazon.orderCount(buyer.address)
      //console.log(result)
      expect(result).to.equal(1)
    })
    it("Adds the order",async()=>{
      const order = await dappazon.orders(buyer.address,1)
      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })
    it ("Emits buy count",()=>{
      expect(transaction).to.emit(dappazon,"Buy")
    })

  })
  describe("Withdrawing",()=>{
    let balanceBefore;

    
    beforeEach(async ()=>{
      //list an item
      let transaction = await dappazon.connect(deployer).list(ID,NAME,CATEGORY,IMAGE,COST, RATING,STOCK);
       await transaction.wait();
      //buy an item
      transaction = await dappazon.connect(buyer).buy(ID,{value:COST})
      await transaction.wait()

      //get deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      //withdraw
      transaction = await dappazon.connect(deployer).withdraw()
      await transaction.wait();
      
    })
   
    it("Updates the owner balance",async ()=>{
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      //console.log(result)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })
    it("Updates buyers contract balance",async ()=>{
      const result = await ethers.provider.getBalance(dappazon.address)
      //console.log(result)
      expect(result).to.equal(0)
    })

  })

  describe("Deployment",()=>{
    it('Sets the owner',async ()=>{
      const addresss = await dappazon.owner();
      expect(addresss).to.equal(deployer.address);
    })

    it('has a name',async ()=>{
    
      const name = await dappazon.name();
      expect(name).to.equal('Dappazon');});
  })


  
})
