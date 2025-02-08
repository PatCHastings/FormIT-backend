// routes/requests.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Request, User, Proposal } = require("../models");

// POST /requests/findOrCreate
router.post("/requests/findOrCreate", auth, async (req, res) => {
  try {
    const { serviceType } = req.body;
    const userId = req.user.id; // from auth middleware (e.g. decoded JWT)

    if (!serviceType) {
      return res.status(400).json({ message: "serviceType is required." });
    }

    // Attempt to find an existing request for this user + serviceType
    let request = await Request.findOne({
      where: { user_id: userId, projectName: serviceType },
    });

    // If not found, create a brand new "draft" request
    if (!request) {
      request = await Request.create({
        user_id: userId,
        projectName: serviceType,
        status: "draft",
      });
    }

    return res.json({
      requestId: request.id,
      serviceType: request.projectName,
    });
  } catch (error) {
    console.error("Error in findOrCreate request:", error);
    return res.status(500).json({ message: "Failed to find or create request." });
  }
});

// -------------------------------------
// create a new request
// -------------------------------------
router.post("/requests", async (req, res) => {
    try {
      const { serviceType } = req.body;
      const userId = req.user?.id; // Assuming authentication middleware adds `req.user`
  
      if (!userId || !serviceType) {
        return res
          .status(400)
          .json({ message: "User ID and service type are required." });
      }
  
      // Check if a request already exists for this user and serviceType
      let request = await Request.findOne({
        where: { user_id: userId, project_name: serviceType },
      });
  
      if (!request) {
        request = await Request.create({
          user_id: userId,
          project_name: serviceType, // Assign serviceType to projectName
          status: "draft", 
        });
      }
  
      res.status(200).json({ message: "Request created successfully.", requestId: request.id });
    } catch (error) {
      console.error("Error creating request:", error);
      res.status(500).json({ message: "Failed to create request." });
    }
  });

  router.get("/client/:userId/requests", async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Fetch the user's requests
      const requests = await Request.findAll({
        where: { user_id: userId },
        attributes: ["id", "projectName", "status"],
        include: [
          {
            model: Proposal,
            as: "proposal", // Must match Request.hasOne(Proposal, { as: 'proposal' })
            attributes: ["id", "status", "version"], // Basic Proposal info
            required: false, // Include requests even if no proposal exists
          },
        ],
      });
  
      res.status(200).json({ requests });
    } catch (error) {
      console.error("Error fetching user requests:", error);
      res.status(500).json({ error: "Failed to fetch user requests." });
    }
  });

module.exports = router;
