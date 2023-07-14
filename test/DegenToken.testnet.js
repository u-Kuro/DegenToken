const { expect } = require("chai");

describe("DegenToken", function () {
    let DegenToken;
    let degentoken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        // Deploy the contract and get contract instances
        DegenToken = await ethers.getContractFactory("DegenToken");
        [owner, addr1, addr2] = await ethers.getSigners();

        // The deployed contract address on the testnet
        const contractAddress = "0x4b1a0D1F11f74256453CdB7d0Ac17D9A8AA37FEd";

        degentoken = await DegenToken.attach(contractAddress);
    });

    it("Should have correct name and symbol", async function () {
        expect(await degentoken.name()).to.equal("Degen");
        expect(await degentoken.symbol()).to.equal("DGN");
    });

    it("Should allow only the owner to mint tokens", async function () {
        const tokensMinted = ethers.utils.parseUnits("1", "ether");
        // Mint from the owner to owner address
        await degentoken.connect(owner).mintTokens(owner.address, tokensMinted);
        const ownerBalance = await degentoken.connect(owner).checkBalance();
        expect(ownerBalance).to.equal(tokensMinted);
        // Mint from addr1 to addr1 address
        try {
            let addr1Balance = await degentoken.connect(addr1).checkBalance();
            await degentoken.connect(addr1).mintTokens(addr1.address, tokensMinted)
            expect(addr1Balance).to.not.equal(tokensMinted);
        } catch (ex) {
            expect(ex.message).to.contain("revert");
        }
    });

    it("Should transfer tokens between accounts", async function () {
        const transferredAmount = ethers.utils.parseUnits("30", "ether");
        await degentoken.connect(owner).mintTokens(addr1.address, transferredAmount.add(1000));
        const addr1BalanceBefore = await degentoken.connect(addr1).checkBalance();

        // Transfer tokens from addr1 to addr2
        await degentoken.connect(addr1).transferTokens(addr2.address, transferredAmount);
        const addr1BalanceAfter = await degentoken.connect(addr1).checkBalance();
        const addr2Balance = await degentoken.connect(addr2).checkBalance();

        // Expect the balance of addr1 to be decreased by transferredAmount
        expect(addr1BalanceAfter).to.equal(addr1BalanceBefore.sub(transferredAmount));
        // Expect the balance of addr2 to be equal to transferredAmount
        expect(addr2Balance).to.equal(transferredAmount);
    });

    it("should allow anyone to redeem tokens", async function () {
        const priceAmount = ethers.utils.parseUnits("10", "ether");
        await degentoken.connect(owner).mintTokens(addr1.address, priceAmount);
        const addr1BalanceBefore = await degentoken.connect(addr1).checkBalance()
        await degentoken.connect(addr1).redeemTokens(priceAmount);
        const addr1BalanceAfter = await degentoken.connect(addr1).checkBalance()
        const expectedAddr1Balance = addr1BalanceBefore.sub(priceAmount);
        expect(addr1BalanceAfter).to.equal(expectedAddr1Balance);
    });

    it("should allow anyone to burn tokens they own", async function () {
        const burnAmount = ethers.utils.parseUnits("20", "ether");
        await degentoken.connect(owner).mintTokens(addr1.address, burnAmount);
        const addr1BalanceBefore = await degentoken.connect(addr1).checkBalance()
        await degentoken.connect(addr1).burnTokens(burnAmount);
        const addr1BalanceAfter = await degentoken.connect(addr1).checkBalance()
        const expectedAddr1Balance = addr1BalanceBefore.sub(burnAmount);
        expect(addr1BalanceAfter).to.equal(expectedAddr1Balance);
    });

    it("should return the correct token balance", async function () {
        const balanceBefore = await degentoken.connect(owner).checkBalance();

        const processedAmount = ethers.utils.parseUnits("40", "ether");
        await degentoken.connect(owner).mintTokens(owner.address, processedAmount);
        await degentoken.connect(owner).burnTokens(processedAmount);

        const balanceAfter = await degentoken.connect(owner).checkBalance();
        // Expect the balance of owner to remain the same
        expect(balanceAfter).to.equal(balanceBefore);
    });
});
