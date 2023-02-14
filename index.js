#!/usr/bin/env node
const fs = require("fs");
const { MongoClient } = require("mongodb");
const { QuickDB } = require("quick.db");

function fatal(msg, aditionalError = null) {
    console.log(msg);
    if (aditionalError) console.error(aditionalError);
    process.exit(1);
}

async function main() {
    const inquirer = (await import("inquirer")).default;
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "How do you want to connect to mongodb?",
            choices: [
                { name: "ip - port - user - password - database", value: 0 },
                { name: "Mongodb url string", value: 1 },
            ],
        },
        {
            type: "input",
            name: "url",
            message: "What is the mongodb connection string?",
            when: (answers) => {
                return answers.choice == 1;
            },
        },
        {
            type: "input",
            name: "ip",
            message: "What is the server ip?",
            when: (answers) => {
                return answers.choice == 0;
            },
        },
        {
            type: "input",
            name: "port",
            message: "What is the server port?",
            when: (answers) => {
                return answers.choice == 0;
            },
        },
        {
            type: "input",
            name: "user",
            message: "What is the user?",
            when: (answers) => {
                return answers.choice == 0;
            },
        },
        {
            type: "input",
            name: "password",
            message: "What is the password?",
            when: (answers) => {
                return answers.choice == 0;
            },
        },
        {
            type: "input",
            name: "database",
            message: "What is the database to use?",
            when: (answers) => {
                return answers.choice == 0;
            },
        },
        {
            type: "input",
            name: "file",
            message: "Where should the sqlite database be saved?",
        },
    ]);

    if (answers.choice == 0) {
        answers.url = `mongodb://${answers.user}:${answers.password}@${answers.ip}:${answers.port}/${answers.database}`;
    }

    if (fs.existsSync(answers.file)) {
        fatal(`file: ${answers.file}: already exist - not overwritting`);
    }

    const db = new QuickDB({ filePath: answers.file });

    const mongoClient = new MongoClient(answers.url);
    let connected = true;
    const e = await mongoClient
        .connect()
        .catch((e) => ((connected = false), e));
    if (!connected) {
        fatal(`Couldn't connec to ${answers.url}`, e);
    }

    const dbConn = mongoClient.db();
    const collections = await dbConn.listCollections().toArray();

    // Process all collections
    console.log("Processing all collections");
    for (const collection of collections) {
        if (collection.type != "collection") continue;
        console.log(`Processing collection: ${collection.name}`);
        const colConn = await dbConn.collection(collection.name);
        const colName = collection.name == "jsons" ? "json" : collection.name;
        const entries = await colConn.find({}).toArray();
        const table = db.table(colName);

        for (const entry of entries) {
            console.log(`Processing entry: ${entry.ID}`);
            await table.set(entry.ID, entry.data);
        }
    }

    await mongoClient.close();
    console.log("Done");
}

main();
