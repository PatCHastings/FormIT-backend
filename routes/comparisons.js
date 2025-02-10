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
router.post("/generate-comparison", async (req, res) => {
  console.log("/generate-comparison endpoint HIT"); // Ensure the route is hit
  console.log("Received Body:", req.body);
  try {
    const { requestId } = req.body;
    if (!requestId) {
      console.error("ERROR: Missing requestId in request body.");
      return res.status(400).json({ error: "Missing requestId in request body." });
    }

    console.log("🔹 Received request to generate comparison for requestId:", requestId);

    // Fetch the proposal for this request
    const proposal = await Proposal.findOne({ where: { request_id: requestId } });
    if (!proposal) {
      console.error("ERROR: No proposal found for this request.");
      return res.status(404).json({ error: "No proposal found for this request." });
    }
    
    console.log("Found Proposal:", proposal.dataValues);

    // Check if a comparison already exists
    let existingComparison = await Comparison.findOne({ where: { requestId } });

    // DEBUG: Ensure OpenAI API is actually being called
    console.log("🚀 Calling OpenAI API...");

    // Build OpenAI prompt
    const messages = [
      {
        role: "system",
        content: `You are a senior project manager and cost/timeline estimation expert specializing in U.S. software development. Your task is to produce a detailed comparative proposal estimate.
    
        First, analyze the project details provided and estimate the industry-standard averages for cost and time based on real-world data for similar software projects:
        - **Project Overview:** ${proposal.project_overview || "Not specified"}
        - **Scope:** ${proposal.project_scope || "Not specified"}
        - **Compliance Requirements:** ${proposal.compliance_requirements || "None specified"}
    
        Then, explain how a streamlined, AI-enhanced process (FormIT's solution) can deliver the project faster and at a lower cost compared to industry standards.
    
        The output must be strictly in JSON format with the following keys:
    
        {
          "timeline": { "industry_estimate": { "time": "X weeks", "cost": "$Y" }, "formit_estimate": { "time": "A weeks", "cost": "$B" }, "justification": "..." },
          "budget": { "industry_estimate": { "cost": "$Y" }, "formit_estimate": { "cost": "$B" }, "justification": "..." }
        }
    
        - Base your estimates on real-world cost and timeline averages for software projects in the U.S.
        - Derive the estimates from the provided **Scope** and **Project Overview**.
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
    });

    console.log("OpenAI Response Received:", completion);

    // Extract raw output from OpenAI response
    const rawOutput = completion.choices[0].message.content.trim();

    console.log("🔹 OpenAI Raw Output:", rawOutput);

    // Attempt to parse JSON response
    let data;
    try {
      data = JSON.parse(rawOutput);
    } catch (parseErr) {
      console.error("ERROR: Could not parse AI response as JSON:", parseErr);
      return res.status(400).json({
        error: "The AI did not return valid JSON. Please refine your prompt.",
        rawOutput,
      });
    }

    console.log("Parsed OpenAI Data:", data);

    // Prepare data for database storage
    const comparisonData = {
      requestId,
      timelineIndustryTime: data.timeline.industry_estimate.time,
      timelineFormitTime: data.timeline.formit_estimate.time,
      budgetIndustryCost: data.budget.industry_estimate.cost,
      budgetFormitCost: data.budget.formit_estimate.cost
    };

    console.log("Storing Comparison Data in Database:", comparisonData);

    // If a comparison exists, update it. Otherwise, create a new one.
    if (existingComparison) {
      await existingComparison.update(comparisonData);
      console.log("Updated existing comparison.");
    } else {
      existingComparison = await Comparison.create(comparisonData);
      console.log("Created new comparison.");
    }

    // Return the structured comparison data
    return res.status(200).json({ comparison: existingComparison });

  } catch (error) {
    console.error("ERROR: Failed to generate comparison:", error);
    return res.status(500).json({ error: "Failed to generate comparison." });
  }
});



module.exports = router;
