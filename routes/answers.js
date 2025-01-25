const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Answer, Request, Question, WizardStep } = require("../models");

// POST /answers - Save answers to the database
router.post("/answers", auth, async (req, res) => {
    try {
      const { requestId, answers, serviceType } = req.body;
      const userId = req.user?.id; // Ensure authentication middleware sets this
  
      // Validate inputs
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({
          message: "Invalid request. 'answers' and 'serviceType' are required.",
        });
      }
  
      if (!requestId && !serviceType) {
        return res
          .status(400)
          .json({ message: "Either 'requestId' or 'serviceType' is required." });
      }
  
      // Fetch the serviceType details from WizardStep
      let projectName = serviceType;
      if (serviceType) {
        const wizardStep = await WizardStep.findOne({
          where: { serviceType },
        });
  
        if (!wizardStep) {
          return res.status(400).json({
            message: `Invalid serviceType: ${serviceType}. No matching WizardStep found.`,
          });
        }
  
        projectName = wizardStep.serviceType; // Use the serviceType as projectName
      }
  
      // Reuse or create a Request
      let request = await Request.findOne({
        where: {
          user_id: userId,
          projectName: projectName, // Match by projectName (serviceType)
        },
      });
  
      if (!request) {
        // If no request exists, create one
        request = await Request.create({
          user_id: userId,
          projectName: projectName,
          status: "draft",
        });
      }
  
      // Save or update each answer
      const answerEntries = Object.entries(answers);
      const updatedAnswers = await Promise.all(
        answerEntries.map(async ([questionId, answerText]) => {
          // Ensure the Question exists
          const question = await Question.findByPk(questionId);
          if (!question) {
            throw new Error(`Question with ID ${questionId} not found.`);
          }
  
          // Check if an answer already exists for this request and question
          const existingAnswer = await Answer.findOne({
            where: {
              request_id: request.id,
              question_id: questionId,
            },
          });
  
          if (existingAnswer) {
            // Update the existing answer
            existingAnswer.answer = answerText;
            await existingAnswer.save();
            return existingAnswer;
          } else {
            // Create a new answer
            return await Answer.create({
              answer: answerText,
              request_id: request.id,
              question_id: questionId,
            });
          }
        })
      );
  
      res.status(200).json({
        message: "Answers saved successfully.",
        data: updatedAnswers,
        requestId: request.id, // Return the requestId for frontend reuse
      });
    } catch (error) {
      console.error("Error saving answers:", error);
      res.status(500).json({
        message: "An error occurred while saving answers.",
        error: error.message,
      });
    }
  });


  router.get("/answers", auth, async (req, res) => {
    const { requestId } = req.query;
    const userId = req.user.id; // from auth middleware (decoded token)
  
    console.log("GET /answers - requestId:", requestId, "userId:", userId);
  
    if (!requestId) {
      return res.status(400).json({ error: "Missing requestId" });
    }
  
    try {
      // 1) Confirm the request belongs to this user
      const request = await Request.findOne({
        where: { id: requestId, user_id: userId },
      });
  
      if (!request) {
        return res
          .status(403)
          .json({ error: "No such request or you do not own this request." });
      }
  
      // 2) Then fetch answers for that request
      const answers = await Answer.findAll({
        where: { request_id: requestId },
        include: [
          {
            model: Question,
            attributes: ["id", "question_text"],
          },
        ],
      });
  
      console.log("Found answers in DB:", answers);
  
      const completedAnswers = answers.map((answer) => ({
        questionId: answer.question_id,
        answerText: answer.answer,
        questionText: answer.question?.question_text,
      }));
  
      console.log("Will return completedAnswers:", completedAnswers);
  
      res.status(200).json({ completedAnswers });
    } catch (error) {
      console.error("Error fetching completed answers:", error);
      res.status(500).json({ error: "Failed to fetch completed answers." });
    }
  });
  
  

module.exports = router;
