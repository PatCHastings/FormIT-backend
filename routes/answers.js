const express = require("express");
const router = express.Router();
const { Answer, Request, WizardStep, Question } = require("../models");

// POST /answers - Save answers to the database
router.post("/answers", async (req, res) => {
    try {
      const { requestId, answers } = req.body;
  
      // Validate the incoming request body
      if (!requestId || !answers || typeof answers !== "object") {
        return res.status(400).json({
          message: "Invalid request. 'requestId' and 'answers' are required.",
        });
      }
  
      // Ensure the Request exists
      const request = await Request.findByPk(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found." });
      }
  
      // Save or update each answer
      const answerEntries = Object.entries(answers); // { questionId: "answer text" }
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
              request_id: requestId,
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
              request_id: requestId,
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
