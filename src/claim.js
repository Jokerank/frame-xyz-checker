import csv from "csvtojson"

let path_to_output = './output-1705784065776.csv'
const data_from_frame = await csv().fromFile(path_to_output) // Путь до файла созданного ботом после проверки в main.js

async function claimTokens(bearer_auth, address) {
    let data = await fetch("https://claim.frame-api.xyz/user/claim", {
    "headers": {
        "accept": "*/*",
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "authorization": `Bearer ${bearer_auth}`,
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
    "body": null,
    "method": "POST"
    });
    switch (data.status) {
        case 201:
            console.log(`Claimed: ${address}`)
            break;
        
        default:
            console.log(`Something went wrong! | Address: ${address}`)
            break;
    }
}

for (let each of data_from_frame) {
    if (Number(each['Total Allocation']) != 0) {
        console.log(`Claiming: ${each.Address}`)
        await claimTokens(each.Token, each.Address)
    }
}

console.log('Done!')