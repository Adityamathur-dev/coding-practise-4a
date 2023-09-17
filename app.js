const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3009, () => {
      console.log("Server Running at http://localhost:3009/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get Player List
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT
            *
        FROM
            cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Add New Player
app.post("/players/", async (request, response) => {
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const postPlayerQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES
        (
            ${playerName},
            ${jerseyNumber},
            ${role})
    `;
  const player = await db.run(postPlayerQuery);
  //console.log(player);
  response.send("Player Added to Team");
});

//Get Player
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  const getPlayerQuery = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//Update Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team
    SET
        player_name = ${playerName},
        jersey_number = ${jerseyNumber},
        role = ${role}
    WHERE
    player_id = ${playerId};
  `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete Player
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE
        FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
