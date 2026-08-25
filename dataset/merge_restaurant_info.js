const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "restaurants_info.csv");
const JSON_PATH = path.join(__dirname, "restaurants_list.json");
const OUTPUT_PATH = path.join(__dirname, "restaurants_list_merged.json");

const csvLines = fs.readFileSync(CSV_PATH, "utf8").trim().split("\n");
const headers = csvLines[0].split(";");

const NUMERIC_FIELDS = new Set(["stars_count", "reviews_count"]);

const infoByObjectID = new Map();
for (const line of csvLines.slice(1)) {
  const fields = line.split(";");
  const record = {};
  headers.forEach((header, i) => {
    if (header === "stars_count") {
      record[header] = Math.round(Number(fields[i]));
    } else if (NUMERIC_FIELDS.has(header)) {
      record[header] = Number(fields[i]);
    } else {
      record[header] = fields[i];
    }
  });
  infoByObjectID.set(record.objectID, record);
}

const restaurants = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

let matched = 0;
for (const restaurant of restaurants) {
  const info = infoByObjectID.get(String(restaurant.objectID));
  if (!info) continue;
  matched++;
  for (const header of headers) {
    if (header === "objectID") continue;
    restaurant[header] = info[header];
  }
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(restaurants, null, 4) + "\n");

console.log(`Matched ${matched} of ${restaurants.length} restaurants.`);
