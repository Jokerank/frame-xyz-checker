import { ethers } from 'ethers'
import csv from "csvtojson"
import { createObjectCsvWriter } from 'csv-writer'

const global_ms = 1000 // Задержка на запрос
const error_ms = 60000 // Задержка если словил ошибку

let all_wallets = await csv().fromFile('./wallets.csv')

let data_to_save = []

let index = 0

for (let wallet of all_wallets) {
    ++index
    await signGeneration(wallet.private_key)
    if (global_ms != 0) {
        console.log(`Waiting for delay: ${global_ms}`)
        await delay(global_ms)
    }
}

async function delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function signGeneration(private_key) {
    const wallet = new ethers.Wallet(private_key)
    const wallet_address = wallet.address

    console.log(`Progress ${index} of ${all_wallets.length} | Address: ${wallet_address}`)

    const message = `You are claiming the Frame Chapter One Airdrop with the following address: ${wallet_address.toLowerCase()}`

    const messageBytes = ethers.toUtf8Bytes(message);

    const signature = await wallet.signMessage(messageBytes)
    await getDataFromFrame(signature, wallet_address)
}

async function errorHandler(error) {
    console.log(error)
    console.log(`Delay on error: ${error_ms} | Retry after`)
    await delay(error_ms)
}

async function getDataFromFrame(signature, wallet_address) {
    let data
    try {
        data = await fetch("https://claim.frame-api.xyz/authenticate", {
        "headers": {
            "accept": "*/*",
            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6,zh-CN;q=0.5,zh;q=0.4",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://www.frame.xyz/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{\"signature\":\"${signature}\",\"address\":\"${wallet_address}\"}`,
        "method": "POST"
        })
    } catch (error) {
        await errorHandler(error)
        return getDataFromFrame(signature, wallet_address)
    }

    switch (data.status) {
        case 200:
            let data_json = await data.json()
            data_to_save.push({
                token: data_json.token,
                ...data_json.userInfo
            })
            break;
        case 429:
            console.log(`Probably cloudflare limit, try to adjust global_ms delay | ${data.status} error`)
            console.log(`Delay on error: ${error_ms} | Retry after`)
            await delay(error_ms)
            return getDataFromFrame(signature, wallet_address)
            break;
        default:
            console.log(`Unknown error ${data.status}`)
            break;
    }
}

let filename_csv = `output-${Date.now()}.csv`

const csvWriter = createObjectCsvWriter({
    path: filename_csv,
    header: [
      { id: 'address', title: 'Address' },
      { id: 'twitterImage', title: 'Twitter Image' },
      { id: 'twitterUsername', title: 'Twitter Username' },
      { id: 'testnetXP', title: 'Testnet XP' },
      { id: 'hasClaimedPoints', title: 'Has Claimed Points' },
      { id: 'hasFollowedTwitter', title: 'Has Followed Twitter' },
      { id: 'pointsClaimed', title: 'Points Claimed' },
      { id: 'tradesMade', title: 'Trades Made' },
      { id: 'volumeTraded', title: 'Volume Traded' },
      { id: 'royaltiesPaid', title: 'Royalties Paid' },
      { id: 'topPercent', title: 'Top Percent' },
      { id: 'rank', title: 'Rank' },
      { id: 'totalAllocation', title: 'Total Allocation' },
      { id: 'token', title: 'Token' }
    ],
  });
  
  csvWriter.writeRecords(data_to_save)
    .then(() => console.log(`Готово! Результат - ${filename_csv}`))
    .catch((error) => console.error('Ошибка записи в CSV:', error));