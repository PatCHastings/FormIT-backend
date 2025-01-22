const express = require("express");
const { WizardStep, Category, Question } = require("../models");

const router = express.Router();

router.get("/wizard", async (req, res) => {
  try {
    const steps = await WizardStep.findAll({
      include: [
        {
          model: Category,
          as: "categories", // Ensure alias matches frontend normalization
          include: [
            {
              model: Question,
              as: "questions", // Ensure alias matches frontend normalization
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
