import express = require('express');
import bodyParser = require('body-parser');
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import fs from "fs";

var PORT: string = process.env.PORT || String(3001);

var FINAL_URL: string = "https://eovhjz1qq09ko9j.m.pipedream.net";

// Create a new express instance
const app: express.Application = express();

//var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/callback', urlencodedParser, function (req, res) {
        const docJSON = JSON.parse(req.body.document);
        
        /*
        #To avoid using a database in this case we'll use local json files.
        1. When signedAndSealed checks true
        2. Go through files looking for file with identical name - the callbacks are saved in the files, this allows us to fetch title and fullname.
        */

       const id = docJSON.id + '.json';

        if (docJSON.signedAndSealed == "true") {

            const docID = docJSON.documentid;

            const documentid = docID + '.json';
            
            fs.readFile('data/' + documentid, 'utf-8', (err, data) => {

               const runThis = async () => {

                try {

                const rawData = JSON.parse(data);
                const parsedData = rawData.document
                const jsonData = JSON.parse(parsedData)
                const fName = (jsonData.parties[0].fields[0].value)
                const LName = (jsonData.parties[0].fields[1].value)

                const fullName = (fName + " " + LName)

                const options = {
                    url: FINAL_URL,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    data: {
                        name: fullName,
                        author: jsonData.title
                    },
                    timeout: 2000
                    };

                    await axios(options)
                    .then(response => {
                        res.sendStatus(response.status)
                    })
                    .catch(
                        function (error) {
                            console.log("Request failed with error: " + error.code);
                            res.sendStatus(408);
                            return;
                        }
                    );
                } 
                catch (e) {
                    console.log(e);
                    res.send("Couldn't find or parse the file.");
                }

                }

                runThis();

            });

        }


        if (typeof docJSON.id !== "undefined") {
            fs.writeFile('data/' + id, JSON.stringify(req.body), (err) => {
                if (err) {
                    throw err;
                }
            });
            res.send("JSON data is saved")
        }
});

app.get('*', function (req, res) {
    res.sendStatus(404);
});

app.listen(PORT, function () {
  console.log("Server listening on ".concat(PORT));
});