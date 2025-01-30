import{exit} from 'process';
import fs from 'fs';
import flags from './flags.js';
import path from "path";

export function loadConfigToEnv(jsonData) {
    const envData = [];

    for (const [key, value] of Object.entries(jsonData)) {
        envData.push(`${key}=${value}`);
    }

    fs.writeFileSync("auth.env", envData.join("\n") + "\n", "utf8", (err) => {
        if (err) {
            console.log("Error writing to .env file:", err);
        } else {
            console.log("Environment variables loaded to process.env and stored in .env file successfully!");
        }
    })
}

//PROCESS FLAGS AND CONVERT TO DICTIONARY
export function processFlags (cmdFlags) {
    /*convert [flag-name1, flag1-value, ...]
     (e.g. ["--mood", "good vibes", "--maxtracks", "10"])
     to { "flag-name1, flag1-value",
    "flag-name2, flag2-value"}
    */
    // verify if public is in flag set and it independently
    let rFlags= {};
    if (cmdFlags.includes("--public")) {
        rFlags["public"] = true;
        cmdFlags = cmdFlags.filter(flag => flag !== "--public");
    } else {
        rFlags["public"] = false;
    }
    
    for (let i = 0; i < cmdFlags.length; i=i+2) {
        // remove "--" from flag names
        rFlags[cmdFlags[i].replace("--", "")] = cmdFlags[i+1];
    }

    /* Complete the dictionary of flags
     when they are not passed by argument */
    for (let flag of flags) {
        if (!Object.keys(rFlags).includes(flag)) {
            rFlags[flag] = null;
        }
    }
    return [rFlags.playlist, rFlags.genre, rFlags.mood, rFlags.duration, rFlags.maxTracks, rFlags.author, rFlags.public, rFlags.description, rFlags.query];
        
}
 

export function checkFlags(args) {
    if (args.length > 0) {
        if (args[0] == "-h" || args[0] == "--help") {
            help();
            exit();
        } else if(args[0] == "-v" || args[0] == "--version" ) {
            version();
            exit();
        }
    }
}

function version() {
    console.log("version 1.0.0");
}

function help() {
    const path = process.cwd();
    let buffer = fs.readFileSync(path + "/assets/cli");
    console.log(buffer.toString());
}


export function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

function parseEnvFile(envContent) {
    return envContent
    .split("\n")
    .filter(line => line.trim && !line.startsWith("#"))
    .reduce((acc, line) => {
        const [key, ...value] = line.split("=");
        acc[key.trim()] = value.join("=").trim();
        return acc;
    }, {});
}

export function updateEnvFile(accessToken, refreshToken) {

    let envContent = "";
    const envPath = path.resolve("auth.env");

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");

        const envVariables = parseEnvFile(envContent);
        
        envVariables["access_token"] = accessToken;
        envVariables["refresh_token"] = refreshToken;

        const updatedEnvContent = Object.entries(envVariables)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

        fs.writeFileSync(envPath, updatedEnvContent, "utf8");
    } else {
        console.log(`${envPath} does not exist!`)
    }
}

export function getRefreshToken() {
    const envPath = path.resolve("auth.env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
    }

    const envVariables = parseEnvFile(envContent);

    return envVariables["refresh_token"];
}