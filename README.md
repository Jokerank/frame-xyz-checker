# Before you begin, make sure to install Node.js and pnpm.

1. Install Node.js:
   - [Node.js LTS](https://nodejs.org/en)

2. Install pnpm:
   - [pnpm Installation](https://pnpm.io/installation)

# Usage

1. ```bash
   pnpm i
2. Add private keys to wallets.csv line by line without 0x do not touch first line "private_key"
3. To check all wallets you need to run "node src/main.js"
4. To claim all founded wallets you need to change 3rd line of code on src/claim.js to actual path of output and run "node src/claim.js"
