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
            where: { serviceType }, // Match serviceType in WizardStep
          });
    
          if (!wizardStep) {
            return res.status(400).json({
              message: `Invalid serviceType: ${serviceType}. No matching WizardStep found.`,
            });
          }
    
          // Use the title as the project_name
          projectName = wizardStep.serviceType;
        }
    
        // Ensure a request exists or create one dynamically
        let request = requestId ? await Request.findByPk(requestId) : null;
    
        if (!request) {
          if (!userId) {
            return res
              .status(401)
              .json({ message: "User authentication required to create a request." });
          }
    
          // Create a new request with the project_name set to the WizardStep title
          request = await Request.create({
            user_id: userId,
            projectName: projectName, // Assign projectName dynamically
            status: "draft", // Default status
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
        });
      } catch (error) {
        console.error("Error saving answers:", error);
        res.status(500).json({
          message: "An error occurred while saving answers.",
          error: error.message,
        });
      }
    });
  

router.get("/answers", async (req, res) => {
    // requestId may be a string; parse it if needed
    const { requestId } = req.query;
  
    if (!requestId) {
      return res.status(400).json({ error: "Missing requestId" });
    }
  
    // Convert to integer if your DB column is int
    const requestIdNum = parseInt(requestId, 10);
    if (isNaN(requestIdNum)) {
      return res.status(400).json({ error: "Invalid requestId" });
    }
  
    try {
      const answers = await Answer.findAll({
        where: { request_id: requestIdNum },
        include: [
          {
            model: Question,
            attributes: ["id", "questionText"],
          },
        ],
      });
  
      // Return both the question IDs and the answers
    const completedAnswers = answers.map((answer) => ({
        questionId: answer.question_id,
        answerText: answer.answer,
      }));
  
      res.json({ completedAnswers });
    } catch (error) {
      console.error("Error fetching completed answers:", error);
      res.status(500).json({ error: "Failed to fetch completed answers." });
    }
  });
  
  

module.exports = router;
