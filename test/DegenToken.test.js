const { expect } = require("chai");
const { network } = require("hardhat");
require('dotenv').config();
const readline = require('readline');
const { promisify } = require("util");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let thash;

describe("DegenToken", function () {
    let DegenToken;
    let degentoken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        // Deploy the contract and get contract instances
        DegenToken = await ethers.getContractFactory("DegenToken");

        switch (network.name) {
            case "hardhat": {
                degentoken = await DegenToken.deploy();
                await degentoken.deployed();

                [owner, addr1, addr2] = await ethers.getSigners();

                break;
            }
            case "fuji": {
                const contractAddress = "0x372e3553Cdfc00b74dff723fe10D9EDed402Afa1";
                // Past Transaction: 0xc20891eD846463D918C57C19D2D1413A5b467a7d
                degentoken = await DegenToken.attach(contractAddress);

                [owner, addr1, addr2] = await ethers.getSigners();

                break;
            }
        }
    });

    it("Should have correct name and symbol", async function () {
        expect(await degentoken.name()).to.equal("Degen");
        expect(await degentoken.symbol()).to.equal("DGN");
    });

    it("Should allow only the owner to mint tokens", async function () {
        this.timeout(0);
        const ownerBalanceBefore = await degentoken.connect(owner, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });
        const addr1BalanceBefore = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });

        const tokensMinted = ethers.utils.parseUnits("1", "gwei");
        // Mint from the owner to owner address
        thash = await degentoken.connect(owner, { gasLimit: 15000000 }).mintTokens(owner.address, tokensMinted, { gasLimit: 15000000 });
        await owner.provider.waitForTransaction(thash.hash);
        const ownerBalance = await degentoken.connect(owner, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });

        expect(ownerBalance.toNumber()).to.equal(ownerBalanceBefore.add(tokensMinted).toNumber());
        // Mint from addr1 to addr1 address
        try {
            thash = await degentoken.connect(addr1, { gasLimit: 15000000 }).mintTokens(addr1.address, tokensMinted, { gasLimit: 15000000 })
            await addr1.provider.waitForTransaction(thash.hash);
            const addr1Balance = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });
            if (typeof addr1Balance.toNumber() === "number") {
                expect(addr1Balance.toNumber()).to.not.equal(addr1BalanceBefore.add(tokensMinted).toNumber());
            } else {
                expect(false).to.be.true;
            }
        } catch (ex) {
            expect(ex.message).to.contain("revert");
        }
    });

    it("Should transfer tokens between accounts", async function () {
        this.timeout(0);

        const transferredAmount = ethers.utils.parseUnits("1", "gwei");
        thash = await degentoken.connect(owner, { gasLimit: 15000000 }).mintTokens(addr1.address, transferredAmount, { gasLimit: 15000000 });
        await owner.provider.waitForTransaction(thash.hash);
        const addr1BalanceBefore = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });

        // Transfer tokens from addr1 to addr2
        const addr2BalanceBefore = await degentoken.connect(addr2, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });
        thash = await degentoken.connect(addr1, { gasLimit: 15000000 }).transferTokens(addr2.address, transferredAmount, { gasLimit: 15000000 });
        await addr1.provider.waitForTransaction(thash.hash);
        const addr1BalanceAfter = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });
        const addr2Balance = await degentoken.connect(addr2, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });

        // Expect the balance of addr1 to be decreased by transferredAmount
        expect(addr1BalanceAfter.toNumber()).to.equal(addr1BalanceBefore.sub(transferredAmount).toNumber());
        // Expect the balance of addr2 to be equal to transferredAmount + balanceBefore
        expect(addr2Balance.toNumber()).to.equal(addr2BalanceBefore.add(transferredAmount).toNumber());
    });

    it("should allow anyone to redeem tokens", async function () {
        this.timeout(0);
        const priceAmount = ethers.utils.parseUnits("1", "gwei");
        thash = await degentoken.connect(owner, { gasLimit: 15000000 }).mintTokens(addr1.address, priceAmount, { gasLimit: 15000000 });
        await owner.provider.waitForTransaction(thash.hash);
        const addr1BalanceBefore = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 })

        // Show NFT Prizes Available
        const redeemPrizes = await degentoken.showRedeemPrizes()
        console.log("\n      Redeem NFT Prizes\n")
        redeemPrizes.forEach((prize) => {
            console.log(`        [${prize.id}] ${prize.name}: ${prize.amount}`);
        })

        // User Chooses an NFT
        const question = promisify(rl.question).bind(rl);
        const userInput = await question('\n      Please Choose a Prize Number: ');
        rl.close();

        // User Redeems NFT Prize and Subtracted to his Tokens
        thash = await degentoken.connect(addr1, { gasLimit: 15000000 }).redeemTokens(userInput, { gasLimit: 15000000 });
        let receipt = await thash.wait()
        await addr1.provider.waitForTransaction(thash.hash);

        // Get the event logs emitted in the transaction receipt
        let event = receipt.events.find((event) => event.event === 'NFTRedeemed');
        let nftRedeemed = event.args.nft;
        console.log(`\n      Congratulations, you've received the NFT named "${nftRedeemed.name}"\n`);
        const addr1BalanceAfter = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 })

        // Chech if it is Subtracted to User Wallet
        const expectedAddr1Balance = addr1BalanceBefore.sub(nftRedeemed.amount);
        expect(addr1BalanceAfter.toNumber()).to.equal(expectedAddr1Balance.toNumber())
    });

    it("should allow anyone to burn tokens they own", async function () {
        this.timeout(0);

        const burnAmount = ethers.utils.parseUnits("1", "gwei");
        thash = await degentoken.connect(owner, { gasLimit: 15000000 }).mintTokens(addr1.address, burnAmount, { gasLimit: 15000000 });
        await owner.provider.waitForTransaction(thash.hash);
        const addr1BalanceBefore = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 })
        thash = await degentoken.connect(addr1, { gasLimit: 15000000 }).burnTokens(burnAmount, { gasLimit: 15000000 });
        await addr1.provider.waitForTransaction(thash.hash);
        const addr1BalanceAfter = await degentoken.connect(addr1, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 })
        const expectedAddr1Balance = addr1BalanceBefore.sub(burnAmount);
        expect(addr1BalanceAfter.toNumber()).to.equal(expectedAddr1Balance.toNumber());
    });

    it("should return the correct token balance", async function () {
        this.timeout(0);

        const balanceBefore = await degentoken.connect(owner, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });

        const processedAmount = ethers.utils.parseUnits("1", "gwei");
        thash = await degentoken.connect(owner, { gasLimit: 15000000 }).mintTokens(owner.address, processedAmount, { gasLimit: 15000000 });
        await owner.provider.waitForTransaction(thash.hash);
        thash = await degentoken.connect(owner, { gasLimit: 15000000 }).burnTokens(processedAmount, { gasLimit: 15000000 });
        await owner.provider.waitForTransaction(thash.hash);

        const balanceAfter = await degentoken.connect(owner, { gasLimit: 15000000 }).checkBalance({ gasLimit: 15000000 });
        // Expect the balance of owner to remain the same
        expect(balanceAfter.toNumber()).to.equal(balanceBefore.toNumber());
    });
});
