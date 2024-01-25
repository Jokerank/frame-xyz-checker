import csv from "csvtojson"
import fs from 'fs'

const output_find = fs.readdirSync('./');
const show_files_to_user = [];

for (let file of output_find) {
    if (file.includes('output-')) {
        show_files_to_user.push(file);
    }
}

if (show_files_to_user.length == 0) {
    throw 'You need to run src/main.js first, output not found!'
}

console.log('Choose file, just put the number you want:')

for (let i = 0; i < show_files_to_user.length; i++) {
    console.log(`${i + 1}. ${show_files_to_user[i]}`);
}

let selectedFileIndex = -1;

process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
    const selectedIndex = parseInt(data.trim()) - 1;

    if (selectedIndex >= 0 && selectedIndex < show_files_to_user.length) {
        selectedFileIndex = selectedIndex;
        console.log(`File in work: ${show_files_to_user[selectedFileIndex]}`);
        process.stdin.removeAllListeners('data'); // Удаляем все обработчики событий для 'data'
        start(`./${show_files_to_user[selectedFileIndex]}`);
    } else {
        console.log('Wrong file number, try again!: ');
    }
});

async function start(path_to_output) {
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
            case 403:
                console.log(`Probably need to run src/main.js again, authorization was old: ${address}`)
                break;
            default:
                console.log(await data.text())
                console.log(`Something went wrong! | Address: ${address} | Status: ${data.status}`)
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
    process.exit(0)
}