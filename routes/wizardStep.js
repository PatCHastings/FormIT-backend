const express = require("express");
const { WizardStep, Category, Question } = require("../models");

const router = express.Router();

router.get("/wizard", async (req, res) => {
  try {
    const { serviceType } = req.query; // e.g. "new_app", "hosting", etc.

    if (!serviceType) {
      return res.status(400).json({ error: "Missing serviceType parameter." });
    }

    // Fetch both general steps and specific steps
    const generalSteps = await WizardStep.findAll({
      where: { service_type: "general" },
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

    const specificSteps = await WizardStep.findAll({
      where: { service_type: serviceType },
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

    // Combine general steps and specific steps
    const combinedSteps = [...specificSteps, ...generalSteps];

    res.status(200).json(combinedSteps);
  } catch (error) {
    console.error("Error fetching wizard steps:", error);
    res.status(500).json({ error: "Failed to fetch wizard steps." });
  }
});

module.exports = router;
