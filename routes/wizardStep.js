const express = require("express");
const { WizardStep, Category, Question } = require("../models");

const router = express.Router();

router.get("/wizard", async (req, res) => {
  try {
    const { serviceType } = req.query; // e.g. "new_app", "hosting", etc.

    const whereClause = {};
    if (serviceType) {
      whereClause.service_type = serviceType;
    }

    const steps = await WizardStep.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "categories",
          include: [
            {
              model: Question,
              as: "questions",
            },
          ],
        },
      ],
      order: [
        ["stepNumber", "ASC"],
        ["categories", "sortOrder", "ASC"],
        ["categories", "questions", "sortOrder", "ASC"],
      ],
    });

    res.status(200).json(steps);
  } catch (error) {
    console.error("Error fetching wizard steps:", error);
    res.status(500).json({ error: "Failed to fetch wizard steps." });
  }
});

module.exports = router;
