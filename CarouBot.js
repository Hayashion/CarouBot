const Discord = require('discord.js');
const client = new Discord.Client();
var scraper = require('./CarouScraper');
const input = require("readline-sync");
var fs = require('fs');

const axios = require("axios").default;
var db = require("./databaseConfig.js");
var moment = require("moment-timezone");
const { type } = require('os');

const baseUrl = "https://www.carousell.sg/aps/cf/1.0/product-search/"
var prefix = "-"
var searchTerms = ["rtx 2070", "gpu", "cpu", "rtx"];


client.on('message', msg => {
    var msgcontent = msg.content;
    if (msgcontent[0] === prefix) {
        msgcontent = msgcontent.slice(prefix.length); //removes prefix
        console.log(msgcontent)
        try {
            var cmdWord = msgcontent.split(' ')[0];  //extracts the command word
            var arg = msgcontent.slice(cmdWord.length + 1) //extracts the command args
            console.log(cmdWord, arg);
        }
        catch (err) {
            console.log("Invalid Command")
        }

        // if (key in cmdList) {

        // }

        if (cmdWord === 'ping') {
            msg.reply('pong');
        }

        else if (cmdWord === 'search') {
            var channel = client.channels.cache.find(channel => channel.id === '639769150914428930');
            channel.send("Searching...")
            startSearch();
        }

        else if (cmdWord === 'set') {
            if (arg.length > 1) {
                searchTerms.push(arg);
                console.log(searchTerms)
                msg.channel.send('Search term has been set to: ' + searchTerms);
            }
            else {
                msg.channel.send("Please provide a search term")
            }
        }

        else if (msgcontent === 'check') {
            msg.channel.send('Search terms are currently: ' + searchTerms);
        }

        else if (msgcontent === 'check') {
            msg.channel.send('Search terms are currently: ' + searchTerms);
        }

        else if (msgcontent === 'shutdown') {
            msg.channel.send('Shutting down...');
            client.destroy();
            throw new Error("CarouBot Shutting Down...");
        }
    }
});

client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`);
});

// client.on('message', msg => {
//     if (msg.content === '==ping') {
//         msg.reply('pong');
//     }
// });

// client.on('message', msg => {
//     if (msg.content === '==search') {
//         filterResults();
//     }
// });

// client.on('message', msg => {
//     if (msg.content.split(' ')[0] === '==set') {
//         searchTerms = msg.content.split(' ')[1];
//         msg.channel.send('Search term has been set to: ' + searchTerms);
//     }
// });

// client.on('message', msg => {
//     if (cmdWord === 'check') {
//         msg.channel.send('Search term is currently: ' + searchTerms);
//     }
// });

// client.on('message', msg => {
//     if (msg.author.id === 'INSERT ID') {
//         msg.guild.channels.find(msg.channel.id)
//         .overwritePermissions(message.author,{
//             SEND_MESSAGES: false,
//         }
//     }
// }
// )



function doSearch(item) { //requests from api and gets
    const promise = axios.post(`${baseUrl}`,
        {
            "count": 10,                                // change this for more results
            "countryCode": "SG",
            "countryId": "1880251",
            "filters": [{ "fieldName": "collections", "idsOrKeywords": { "value": ["214"] } }],
            "isFreeItems": false,
            "locale": "en",
            "prefill": { "prefill_sort_by": "" },
            "query": item                               // change this for different query
        })
    const dataPromise = promise.then(
        function (response) {
            var data = response.data
            if (response.status == 200) {
                console.log("Success!");
                var listings = data.data.results
            }
            return listings

        }
    )
        .catch(function (error) {
            console.log("==Error Encountered==");
        });
    // console.log(dataPromise);
    return dataPromise;

}
function checkDb(listing) {
    var title = listing.title;
    var id = listing.id

    var file = fs.readFileSync('listingid.txt', 'utf-8')
    var lines = file.split('\n');
    if (lines.includes(id.toString()) === false) {
        addDb(listing);
        console.log("Added to listing", title)
    }
    // else { console.log("Already exists!"); }


    //Check if listing exists in DB
    // var conn = db.getConnection();
    // conn.connect(function (err) {
    //     if (err) {
    //         return callback(err, null);
    //     }
    //     else {
    //         var sql = 'SELECT * FROM listings WHERE title = ?';
    //         conn.query(sql, [title], function (err, result) {
    //             conn.end();
    //             if (err) {
    //                 return err;
    //             } else {
    //                 if (result.length == 0) {
    //                     addDb(listing);
    //                 }
    //             }
    //         });
    //     }
    // });
}

function addDb(listing) {
    var title = listing.title;
    var price = listing.price;
    var user = listing.user;
    var datetime = listing.datetime;
    var link = listing.link;
    var thumbnail = listing.thumbnail;
    var id = listing.id

    fs.appendFileSync('listingid.txt', '\n' + id, function (err) {
        if (err)
            console.log('Error Encountered');
        else
            console.log('Added to Database!');
    });

    var channel = client.channels.cache.find(channel => channel.id === '639769150914428930');
    // channel.send(`Title: ${title}\nPrice: ${price}\nUser: ${user}\nDateTime: ${datetime}\nLink: ${link}`)
    const embed = new Discord.MessageEmbed()
        // .setAuthor(`${client.user.tag}`, `${client.user.displayAvatarURL}`)
        .setTimestamp(new Date())
        .setTitle(`${title}`)
        .setThumbnail(`${thumbnail}`) //change to listing image in future
        .addField("Price: ", `${price}`)
        .addField("User: ", `${user}`)
        .addField("Time of Listing: ", moment.unix(`${datetime}`).tz('Asia/Singapore').format('DD/MM HH:mm'))
        .addField("Link", `<${link}>`)
    channel.send(embed);




    // var conn = db.getConnection();
    // conn.connect(function (err) {
    //     if (err) {
    //         return err;
    //     }
    //     else {
    //         sql = 'INSERT INTO listings(title,price,user,datetime,link,thumbnail) values(?,?,?,?,?,?)';
    //         conn.query(sql, [title, price, user, datetime, link, thumbnail], function (err, result) {
    //             conn.end();
    //             if (err) {
    //                 return err
    //             } else {
    //                 var channel = client.channels.cache.find(channel => channel.id === '639769150914428930');
    //                 // channel.send(`Title: ${title}\nPrice: ${price}\nUser: ${user}\nDateTime: ${datetime}\nLink: ${link}`)
    //                 const embed = new Discord.MessageEmbed()
    //                     // .setAuthor(`${client.user.tag}`, `${client.user.displayAvatarURL}`)
    //                     .setTimestamp(new Date())
    //                     .setTitle(`${title}`)
    //                     .setThumbnail(`${thumbnail}`) //change to listing image in future
    //                     .addField("Price: ", `${price}`)
    //                     .addField("User: ", `${user}`)
    //                     .addField("Time of Listing: ", moment.unix(`${datetime}`).tz('Asia/Singapore').format('DD/MM HH:mm'))
    //                     .addField("Link", `<${link}>`)
    //                 channel.send(embed);
    //                 console.log("Added to database!");
    //             }
    //         }
    //         )
    //     };
    // }
    // )
};

async function filterResults(item, index) { //Main function to spin off all other functions
    filteredResults = [];
    listings = await doSearch(item);
    for (var i = 0; i < listings.length; i++) {
        var currListing = listings[i].listingCard
        var listingInfo = {
            title: currListing.belowFold[0].stringContent,
            price: currListing.belowFold[1].stringContent,
            user: currListing.seller.username,
            datetime: currListing.aboveFold[0].timestampContent.seconds.low,
            link: "https://sg.carousell.com/p/" + currListing.id,
            thumbnail: currListing.photoUrls[0],
            id: currListing.id

        }
        // console.log(listingInfo);
        checkDb(listingInfo);
    }
    return filteredResults;
}

function startSearch() {
    searchTerms.forEach(filterResults);
}

function slowMode(msg){

}

client.login(key);
// setTimeout(startSearch, 5000);
// setInterval(startSearch, 120000);
