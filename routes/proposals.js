"use strict";

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

// 1) Import the new "OpenAI" class from the package
const OpenAI = require("openai").default;

// 2) Destructure your Sequelize models from ../models/index.js
const { Proposal, Request, Answer, Question, User } = require("../models");

// 3) Create an OpenAI instance with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // e.g. "sk-..."
});

// Optional: Rate-limit threshold in minutes for AI generation
const RATE_LIMIT_MINUTES = 15;

/* -------------------------------------------
 * GET /proposals?requestId=XX
 * Fetch an existing proposal by requestId
 ------------------------------------------- */
 router.get("/client/:requestId", async (req, res) => {
  const { requestId } = req.params; // Extract requestId from URL param
  if (!requestId) {
    return res.status(400).json({ error: "Missing requestId parameter." });
  }
  try {
    const proposal = await Proposal.findOne({
      where: { request_id: requestId },
      attributes: [
        "id",
        "request_id",
        "proposal_content",
        "version",
        "status",
        "last_generated_at",
        "project_overview",
        "project_scope",
        "timeline",
        "budget",
        "terms_and_conditions",
        "next_steps",
        "deliverables",
        "compliance_requirements",
        "admin_notes",
      ],
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found." });
    }

    return res.status(200).json({ proposal });
  } catch (err) {
    console.error("Error fetching proposal:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route: Fetch proposals for the logged-in client
router.get("/client/:userId", async (req, res) => { 
  try {
    const { userId } = req.params;

    // Ensure the user exists and is a client
    const client = await User.findOne({ where: { id: userId, role: "client" } });
    if (!client) {
      return res.status(404).json({ error: "Client not found." });
    }

    // ✅ Fetch all proposals for this user's requests
    const proposals = await Proposal.findAll({
      include: [
        {
          model: Request,
          as: "request",
          attributes: ["id", "project_name"],
        },
      ],
      where: { 
        "$request.user_id$": userId  // ✅ Filtering at the Proposal level
      },
      attributes: [
        "id",
        "request_id",
        "status",
        "last_generated_at",
        "project_overview",
        "project_scope",
        "timeline",
        "budget",
        "terms_and_conditions",
        "next_steps",
        "deliverables",
        "compliance_requirements",
        "admin_notes",
      ],
    });

    console.log("Fetched proposals count:", proposals.length);  // Debugging log

    res.status(200).json({ proposals });
  } catch (error) {
    console.error("Error fetching client proposals:", error);
    res.status(500).json({ error: "Failed to fetch client proposals." });
  }
});

/* -------------------------------------------
 * POST /proposals/generate
 * Builds a prompt from client answers,
 * calls GPT-4 (or GPT-3.5, etc.), and
 * saves the AI-generated text to the proposals table
 ------------------------------------------- */
 router.post("/generate", async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: "Missing requestId" });
    }

    // 1) Load the Request & Answers
    const clientRequest = await Request.findByPk(requestId, {
      include: [
        {
          model: Answer,
          as: "answers",
          include: [{ model: Question, as: "question" }],
        },
      ],
    });
    if (!clientRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Optional rate-limit check
    let existingProposal = await Proposal.findOne({ where: { request_id: requestId } });
    // if (existingProposal) {
    //   const now = new Date();
    //   const lastTime = existingProposal.lastGeneratedAt || new Date(0);
    //   const diffMs = now - lastTime;
    //   if (diffMs < RATE_LIMIT_MINUTES * 60 * 1000) {
    //     return res.status(429).json({
    //       error: `Rate limit: Only one proposal generation every ${RATE_LIMIT_MINUTES} minutes.`,
    //     });
    //   }
    // }

    // 2) Build the 'answersText' from all Q&A
    let answersText = "";
    clientRequest.answers.forEach((answer) => {
      const qText = answer.question?.questionText || "Unknown question";
      answersText += `Question: ${qText}\nAnswer: ${answer.answer}\n\n`;
    });

    // 3) Prepare ChatGPT messages
    //   Force ChatGPT to return strictly valid JSON with these fields:
    //   "project_overview", "project_scope", "timeline", "budget",
    //   "terms_and_conditions", "next_steps", "deliverables", "compliance_requirements"
    const messages = [
      {
        role: "developer",
        content: `You are a senior dev generating a project proposal. 
Return valid JSON ONLY with these exact keys:

{
  "project_overview": "...",
  "project_scope": "...",
  "timeline": "...",
  "budget": "...",
  "terms_and_conditions": "...",
  "next_steps": "...",
  "deliverables": "...",
  "compliance_requirements": "..."
}

No additional text or disclaimers. 
If any section is not applicable, leave it as an empty string.`,
      },
      {
        role: "user",
        content: `Based on these client answers:\n\n${answersText}\n\n
Focus on how AI coding can speed up development at lower cost.
Strictly return a JSON object with the fields above.`,
      },
    ];

    // 4) Call GPT-4 (or gpt-3.5) with the messages
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      store: true,
      max_tokens: 1200,
      temperature: 0.7,
    });

    // 'rawOutput' is what ChatGPT responded
    const rawOutput = completion.choices[0].message.content.trim();

    // 5) Parse the JSON
    let data;
    try {
      data = JSON.parse(rawOutput);
    } catch (parseErr) {
      console.error("Could not parse AI response as JSON:", parseErr);
      // fallback: store entire raw text or return error
      return res.status(400).json({
        error: "The AI did not return valid JSON. Please refine your prompt.",
        rawOutput,
      });
    }

    // data should be like:
    // {
    //   "project_overview": "...",
    //   "project_scope": "...",
    //   "timeline": "...",
    //   "budget": "...",
    //   "terms_and_conditions": "...",
    //   "next_steps": "...",
    //   "deliverables": "...",
    //   "compliance_requirements": "..."
    // }

    // 6) Create or update the proposal in the DB
    let proposal = existingProposal;
    if (!proposal) {
      proposal = await Proposal.create({
        request_id: requestId,
        // Map each field from data to your DB columns
        projectOverview: data.project_overview || "",
        projectScope: data.project_scope || "",
        timeline: data.timeline || "",
        budget: data.budget || "",
        termsAndConditions: data.terms_and_conditions || "",
        nextSteps: data.next_steps || "",
        deliverables: data.deliverables || "",
        complianceRequirements: data.compliance_requirements || "",
        // fallback fields
        version: 1,
        status: "draft",
        lastGeneratedAt: new Date(),
      });
    } else {
      // If the proposal already exists, update it
      proposal.projectOverview = data.project_overview || "";
      proposal.projectScope = data.project_scope || "";
      proposal.timeline = data.timeline || "";
      proposal.budget = data.budget || "";
      proposal.termsAndConditions = data.terms_and_conditions || "";
      proposal.nextSteps = data.next_steps || "";
      proposal.deliverables = data.deliverables || "";
      proposal.complianceRequirements = data.compliance_requirements || "";
      proposal.version += 1;
      proposal.status = "draft";
      proposal.lastGeneratedAt = new Date();
      await proposal.save();
    }

    return res.status(200).json({ proposal, rawOutput });
  } catch (error) {
    console.error("Error generating proposal:", error);
    return res.status(500).json({ error: "Failed to generate proposal." });
  }
});

/* -------------------------------------------
 * POST /proposals
 * Creates or updates a proposal's new fields
 * Expecting in req.body:
 * {
 *   requestId,
 *   proposalContent, // optional if your schema still uses it
 *   projectOverview,
 *   projectScope,
 *   timeline,
 *   budget,
 *   termsAndConditions,
 *   nextSteps,
 *   deliverables,
 *   complianceRequirements,
 *   adminNotes,
 *   status, // e.g. "draft", "submitted", "approved"
 *   version // optional integer for versioning
 * }
 ------------------------------------------- */
 
 router.post("/:requestId", async (req, res) => {
  const {
    requestId,
    proposalContent,
    projectOverview,
    projectScope,
    timeline,
    budget,
    termsAndConditions,
    nextSteps,
    deliverables,
    complianceRequirements,
    adminNotes,
    status,
    version,
  } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: "Missing requestId in request body." });
  }

  try {
    // Ensure the request exists
    const clientRequest = await Request.findByPk(requestId);
    if (!clientRequest) {
      return res.status(404).json({ error: "No matching Request found." });
    }

    // Check if there's already a proposal for this request
    let proposal = await Proposal.findOne({ where: { request_id: requestId } });

    if (!proposal) {
      // Create new proposal
      proposal = await Proposal.create({
        request_id: requestId,
        proposalContent: proposalContent || "",
        projectOverview: projectOverview || null,
        projectScope: projectScope || null,
        timeline: timeline || null,
        budget: budget || null,
        termsAndConditions: termsAndConditions || null,
        nextSteps: nextSteps || null,
        deliverables: deliverables || null,
        complianceRequirements: complianceRequirements || null,
        adminNotes: adminNotes || null,
        status: status || "draft",
        version: version || 1,
      });
    } else {
      // Update existing proposal
      if (proposalContent !== undefined) proposal.proposalContent = proposalContent;
      if (projectOverview !== undefined) proposal.projectOverview = projectOverview;
      if (projectScope !== undefined) proposal.projectScope = projectScope;
      if (timeline !== undefined) proposal.timeline = timeline;
      if (budget !== undefined) proposal.budget = budget;
      if (termsAndConditions !== undefined) proposal.termsAndConditions = termsAndConditions;
      if (nextSteps !== undefined) proposal.nextSteps = nextSteps;
      if (deliverables !== undefined) proposal.deliverables = deliverables;
      if (complianceRequirements !== undefined) {
        proposal.complianceRequirements = complianceRequirements;
      }
      if (adminNotes !== undefined) proposal.adminNotes = adminNotes;
      if (status !== undefined) proposal.status = status;
      if (version !== undefined) proposal.version = version;

      await proposal.save();
    }

    return res.status(200).json({ proposal });
  } catch (err) {
    console.error("Error saving proposal:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
