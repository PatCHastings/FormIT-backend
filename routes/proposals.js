"use strict";

const express = require("express");
const router = express.Router();

// 1) Import the new "OpenAI" class from the package
const OpenAI = require("openai").default;

// 2) Destructure your Sequelize models from ../models/index.js
const { Proposal, Request, Answer, Question } = require("../models");

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
router.get("/", async (req, res) => {
  const { requestId } = req.query;
  if (!requestId) {
    return res.status(400).json({ error: "Missing requestId query param." });
  }
  try {
    const proposal = await Proposal.findOne({ where: { request_id: requestId } });
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found." });
    }
    return res.json({ proposal });
  } catch (err) {
    console.error("Error fetching proposal:", err);
    return res.status(500).json({ error: "Internal Server Error" });
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
router.post("/", async (req, res) => {
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

    // 2) Rate limit check
    let existingProposal = await Proposal.findOne({ where: { request_id: requestId } });
    if (existingProposal) {
      const now = new Date();
      const lastTime = existingProposal.lastGeneratedAt || new Date(0);
      const diffMs = now - lastTime;
    //   if (diffMs < RATE_LIMIT_MINUTES * 60 * 1000) {
    //     return res.status(429).json({
    //       error: `Rate limit: Only one proposal generation every ${RATE_LIMIT_MINUTES} minutes.`,
    //     });
    //   }
    }

    // 3) Build the prompt from answers
    let answersText = "";
    clientRequest.answers.forEach((answer) => {
      const qText = answer.question ? answer.question.questionText : "Unknown question";
      answersText += `Question: ${qText}\nAnswer: ${answer.answer}\n\n`;
    });

    // 4) Prepare the ChatGPT messages
    const messages = [
      {
        role: "developer",
        content:
          "You are a senior dev generating a cost-effective project proposal. " +
          "Format with Overview, Scope, Timeline, Budget, Deliverables, etc.",
      },
      {
        role: "user",
        content: `Based on these client answers:\n\n${answersText}\n\n` +
          "Generate a concise but thorough project proposal. Use bullet points, short paragraphs, " +
          "and ensure it's cost-effective.",
      },
    ];

    // 5) Call GPT-4, GPT-3.5, etc.
    const completion = await openai.chat.completions.create({
      model: "gpt-4",  // or "gpt-3.5-turbo"
      messages,
      store: true,
      max_tokens: 1200,
      temperature: 0.7,
    });

    const proposalContent = completion.choices[0].message.content.trim();

    // 6) Create or update the proposal
    let proposal = existingProposal;
    if (!proposal) {
      proposal = await Proposal.create({
        request_id: requestId,
        proposalContent,
        version: 1,
        status: "draft",
        lastGeneratedAt: new Date(),
      });
    } else {
      proposal.proposalContent = proposalContent;
      proposal.version += 1;
      proposal.status = "draft";
      proposal.lastGeneratedAt = new Date();
      await proposal.save();
    }

    return res.status(200).json({ proposal });
  } catch (error) {
    console.error("Error generating proposal:", error);
    return res.status(500).json({ error: "Failed to generate proposal." });
  }
});

module.exports = router;
