require("dotenv").config();
const { Database } = require("quickmongo");

const db = new Database(process.env.URL);
db.on("ready", async () => {
    await db.set("test", 1);
    await db.set("test2", true);
    await db.set("test3", false);
    await db.set("test4", ["2"]);
    await db.set("test5", [{ obbject: "name" }]);
    await db.set("test6", { dwojhdw: "dwijdaqwqe" });
    await db.set("test7", [3, true]);
    await db.set("test8", "simple string");

    const col = await db.useCollection("other_collection");

    await col.set("col", 1);
    await col.set("col2", true);
    await col.set("col3", false);
    await col.set("col4", ["2"]);
    await col.set("col5", [{ obbject: "name" }]);
    await col.set("col6", { dwojhdw: "dwijdaqwqe" });
    await col.set("col7", [3, true]);
    await col.set("col8", "simple string");

    await db.close();
});

db.connect();
