const express = require('express');
const { User, Request, Answer, Question } = require('../models');

const router = express.Router();

// Route: Fetch users with their associated answers
router.get('/users-with-answers', async (req, res) => {
  try {
    const usersWithAnswers = await User.findAll({
      where: { role: 'client' }, // Fetch only users with the client role
      include: [
        {
          model: Request,
          as: 'requests', // Alias for the association
          include: [
            {
              model: Answer,
              as: 'answers', // Alias for the association
              include: [
                {
                  model: Question,
                  as: 'question', // Alias for the association
                  attributes: ['id', 'question_text'], // Use snake_case column names
                },
              ],
              attributes: ['id', 'answer', 'question_id'], // Use snake_case column names
            },
          ],
          attributes: ['id', 'project_name'], // Use snake_case column names
        },
      ],
      attributes: ['id', 'email', 'full_name'], // Use snake_case column names
    });

    // Respond with the retrieved data
    res.status(200).json(usersWithAnswers);
  } catch (error) {
    console.error('Error fetching users with answers:', error);
    res.status(500).json({ error: 'Failed to fetch users with answers.' });
  }
});

router.get('/user-form/:clientId', async (req, res) => {
    const { clientId } = req.params;
  
    try {
      const user = await User.findByPk(clientId, {
        include: [
          {
            model: Request,
            as: 'requests',
            include: [
              {
                model: Answer,
                as: 'answers',
                include: [
                  {
                    model: Question,
                    as: 'question',
                    attributes: ['id', 'question_text'],
                  },
                ],
                attributes: ['id', 'answer', 'question_id'],
              },
            ],
            attributes: ['id', 'project_name'],
          },
        ],
        attributes: ['id', 'full_name', 'email'],
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user form data:', error);
      res.status(500).json({ error: 'Failed to fetch user form data.' });
    }
  });

module.exports = router;
