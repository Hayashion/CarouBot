const axios = require("axios").default;
var db = require("./databaseConfig.js");
var moment = require("moment-timezone");

const baseUrl = "https://sg.carousell.com/api-service/filter/search/3.3/products/"

function doSearch() {
    const promise = axios.post(`${baseUrl}`,
        {
            "count": 25,
            "countryCode": "SG",
            "countryId": "1880251",
            "filters": [{ "fieldName": "collections", "idsOrKeywords": { "value": ["214"] } }],
            "isFreeItems": false,
            "locale": "en",
            "prefill": { "prefill_sort_by": "" },
            "query": "gpu"                                  // change this for different query
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
            console.log(error);
        });
    // console.log(dataPromise);
    return dataPromise;

}

function checkDb(listing) {
    var title = listing.title;

    //Check if listing exists in DB
    var conn = db.getConnection();
    conn.connect(function (err) {
        if (err) {
            return callback(err, null);
        }
        else {
            var sql = 'SELECT * FROM listings WHERE title = ?';
            conn.query(sql, [title], function (err, result) {
                conn.end();
                if (err) {
                    return err;
                } else {
                    if (result.length == 0) {
                        addDb(listing);
                    }
                }
            });
        }
    });
}

function addDb(listing) {
    var title = listing.title;
    var price = listing.price;
    var user = listing.user;
    var datetime = listing.datetime;
    var link = listing.link;
    var conn = db.getConnection();
    conn.connect(function (err) {
        if (err) {
            return err;
        }
        else {
            sql = 'INSERT INTO listings(title,price,user,datetime,link) values(?,?,?,?,?)';
            conn.query(sql, [title, price, user, datetime, link], function (err, result) {
                conn.end();
                if (err) {
                    return err
                } else {
                    // fire msg
                    console.log("Added to database!");
                }
            }
            )
        };
    }
    )
};

async function filterResults() { //Main function to spin off all other functions
    filteredResults = [];
    listings = await doSearch();
    for (var i = 0; i < listings.length; i++) {
        var currListing = listings[i].listingCard
        var listingInfo = {
            title: currListing.belowFold[0].stringContent,
            price: currListing.belowFold[1].stringContent,
            user: currListing.seller.username,
            datetime: moment.unix(currListing.aboveFold[0].timestampContent.seconds.low).tz('Asia/Singapore').format('DD/MM HH:mm'),
            link: "https://sg.carousell.com/p/" + currListing.id
        }
        // console.log(listingInfo);
        checkDb(listingInfo);
    }
    return filteredResults;
}



