"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const OpenAI = require("openai").default;
const { Proposal, Comparison } = require("../models");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/comparisons/generate-comparison - Generate and store industry vs AI cost/time comparison
router.post("/generate-comparison", auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: "Missing requestId in request body." });
    }

    // Fetch the existing proposal for this request
    const proposal = await Proposal.findOne({ where: { request_id: requestId } });
    if (!proposal) {
      return res.status(404).json({ error: "No proposal found for this request." });
    }

    // Check if a comparison already exists for this request
    let existingComparison = await Comparison.findOne({ where: { requestId } });

    // Build a project-specific prompt using proposal data
    const messages = [
      {
        role: "system",
        content: `You are a senior project manager and cost/timeline estimation expert specializing in U.S. software development. Your task is to produce a detailed comparative proposal estimate.

First, provide the industry-standard averages for cost and time in the context of a typical software project similar to this one:
- **Project Overview:** ${proposal.project_overview || "Not specified"}
- **Scope:** ${proposal.project_scope || "Not specified"}
- **Timeline:** ${proposal.timeline || "Not specified"}
- **Budget:** ${proposal.budget || "Not specified"}
- **Compliance Requirements:** ${proposal.compliance_requirements || "None specified"}

Then, explain how a streamlined, AI-enhanced process (FormIT's solution) can deliver the project faster and at a lower cost.

The output must be strictly in JSON format with the following keys:

{
  "timeline": { "industry_estimate": { "time": "X weeks", "cost": "$Y" }, "formit_estimate": { "time": "A weeks", "cost": "$B" }, "justification": "..." },
  "budget": { "industry_estimate": { "cost": "$Y" }, "formit_estimate": { "cost": "$B" }, "justification": "..." }
}

- Use real-world cost and timeline averages based on U.S. software development industry data.
- Explain why AI-driven development methods reduce time and cost (e.g., AI-assisted coding, automated testing, cloud deployment).
- Do NOT include any extra text outside of the JSON object.`
      }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 800,
      temperature: 0.7,
      store: true,
    });

    // Extract raw output from OpenAI response
    const rawOutput = completion.choices[0].message.content.trim();

    // Attempt to parse JSON response
    let data;
    try {
      data = JSON.parse(rawOutput);
    } catch (parseErr) {
      console.error("Could not parse AI response as JSON:", parseErr);
      return res.status(400).json({
        error: "The AI did not return valid JSON. Please refine your prompt.",
        rawOutput,
      });
    }

    // Prepare data for database storage
    const comparisonData = {
      requestId,
      timelineIndustryTime: data.timeline.industry_estimate.time,
      timelineFormitTime: data.timeline.formit_estimate.time,
      budgetIndustryCost: data.budget.industry_estimate.cost,
      budgetFormitCost: data.budget.formit_estimate.cost
    };

    // If a comparison exists, update it. Otherwise, create a new one.
    if (existingComparison) {
      await existingComparison.update(comparisonData);
    } else {
      existingComparison = await Comparison.create(comparisonData);
    }

    // Return the structured comparison data
    return res.status(200).json({ comparison: existingComparison });

  } catch (error) {
    console.error("Error generating comparison:", error);
    return res.status(500).json({ error: "Failed to generate comparison." });
  }
});

module.exports = router;
