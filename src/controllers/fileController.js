"use strict";

const {
  idTypeValidationOr400,
  isExistOnTableOr404,
} = require("../helpers/utils");
const { Team } = require("../models/teamModel");

module.exports.file = {
  getTeamFile: async (req, res) => {
    const teamId = req.params.teamId;
    idTypeValidationOr400(teamId, "Invalid team id type!");

    const team = await isExistOnTableOr404(
      Team,
      { _id: teamId },
      "Team Member not for four image!"
    );

    // console.log('team', team)
    const base64Image = team?.image?.buffer.toString("base64");
    const imgSrc = `data:${team.image.mimeType};base64,${base64Image}`;

    // res.set("Content-Type", team?.image?.mimeType);
    res.set("Content-Type", "text/plain");  
    res.send(imgSrc);  
  },
};
