const Teams= require("../models/teamsModel");
exports.createTeam=async (req,res)=>{
    try{
        const team=new Teams(req.body);
        await team.save();
        res.status(201).json(team);
    }catch(error){
        res.status(400).json({success: false,message: error.message});
    }
}

exports.updateTeamPlayers = async (req, res) => {
    const { teamId } = req.params;
    const { playerId, playerName } = req.body; // Assuming you're sending playerId and playerName in the request body
  
    try {
      // Find the team by its ID
      const teamExisting = await Teams.findById(teamId);
      
      // If the team doesn't exist, return an error response
      if (!teamExisting) {
        return res.status(404).json({ success: false, message: "Team not found" });
      }
  
      // Add the new player to the players array
      teamExisting.players.push({
        playerId, // ObjectId of the player
        playerName // Name of the player
      });
  
      // Save the updated team
      await teamExisting.save();
  
      // Return success response with the updated team
      res.status(200).json({ success: true, message: "Player added to team", team: teamExisting });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error updating team" });
    }
  };
  
 exports.getTeamPlayers=async(req, res)=>{
  try {
    const teams= await Teams.find()
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error getting teams" });
    
  }
 }
 
 exports.getTeams