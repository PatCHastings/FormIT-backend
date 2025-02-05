const express = require('express');
const { User, Request, Answer, Question, Proposal } = require('../models');

const router = express.Router();

// Route: Fetch users with their associated answers
router.get('/users-with-answers', async (req, res) => {
  try {
    const usersWithAnswers = await User.findAll({
      where: { role: 'client' }, // Only users with the 'client' role
      attributes: ['id', 'email', 'full_name'], // Snake-case columns if needed
      include: [
        {
          model: Request,
          as: 'requests', // Must match User.hasMany(Request, { as: 'requests' })
          attributes: ['id', 'project_name'],
          include: [
            {
              model: Answer,
              as: 'answers', // Must match Request.hasMany(Answer, { as: 'answers' })
              attributes: ['id', 'answer', 'question_id'],
              include: [
                {
                  // IMPORTANT: 'question' must match Answer.belongsTo(Question, { as: 'question' })
                  model: Question,
                  as: 'question', // not 'questions'
                  attributes: ['id', 'question_text'],
                },
              ],
            },
            {
              // If your index.js says Request.hasOne(Proposal, { as: 'proposal' })
              // Then we use 'proposal' here
              model: Proposal,
              as: 'proposal', // not 'proposals'
              required: false, // so requests without a proposal are still included
              attributes: [
                'id',
                'status',
                'version',
                'project_overview', 
                'project_scope',
                'timeline',
                'budget',
                'terms_and_conditions',
                'next_steps',
                'deliverables',
                'compliance_requirements',
                'admin_notes',
              ],
            },
          ],
        },
      ],
    });

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
