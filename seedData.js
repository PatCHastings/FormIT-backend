const { WizardStep, Category, Question } = require('./models');

const seedData = async () => {
  try {
    const steps = [
        {
          title: "Company & Stakeholder Information", // Wizard Step
          categories: [
            {
              title: "Company Background", // Subcategory
              questions: [
                "What does your company do?",
                "Who are your primary customers or end users?",
              ],
            },
            {
              title: "Contact Details & Stakeholders", // Subcategory
              questions: [
                "Who will be our primary point of contact?",
                "Are there other key stakeholders we should know about (e.g., decision-makers, technical leads)?",
              ],
            },
            {
              title: "Project Vision & Goals", // Subcategory
              questions: [
                "What is your main objective for creating this software/application?",
                "How does it fit into your overall business strategy?",
              ],
            },
          ],
        },
        {
          title: "Project Scope & Requirements", // Wizard Step
          categories: [
            {
              title: "Purpose & Objectives", // Subcategory
              questions: [
                "What problem(s) are you trying to solve?",
                "What are the must-have features for the initial release?",
              ],
            },
            {
              title: "Success Criteria", // Subcategory
              questions: [
                "How will you measure the success of the application?",
                "What metrics (e.g., user adoption, revenue, cost savings) are most important?",
              ],
            },
          ],
        },
        {
          title: "Target Audience & User Experience",
          categories: [
            {
              title: "User Profiles",
              questions: [
                "Who are the primary users of your software?",
                "Are there any specific accessibility needs?",
              ],
            },
            {
              title: "User Journey",
              questions: [
                "How do you envision users navigating through the application?",
              ],
            },
          ],
        },
        {
          title: "Technical Considerations",
          categories: [
            {
              title: "Existing Systems & Integrations",
              questions: [
                "Do you have existing systems this application needs to integrate with?",
              ],
            },
            {
              title: "Technology Preferences",
              questions: [
                "Do you have any preferred programming languages or frameworks?",
              ],
            },
            {
              title: "Scalability & Performance",
              questions: ["How many users do you expect to use the application?"],
            },
          ],
        },
        {
          title: "Project Timeline & Milestones",
          categories: [
            {
              title: "Ideal Launch Date",
              questions: [
                "Do you have a deadline or event that dictates the launch?",
              ],
            },
            {
              title: "Phased Delivery",
              questions: ["Are you open to iterative delivery (e.g., MVP, beta)?"],
            },
            {
              title: "Milestones & Reviews",
              questions: [
                "What milestones or checkpoints are critical?",
                "How often do you want progress updates or demos?",
                "Who needs to sign off at each milestone?",
              ],
            },
          ],
        },
        {
          title: "Budget & Financials",
          categories: [
            {
              title: "Budget Range",
              questions: [
                "What is your estimated or approved budget range?",
                "Do you have contingency funds for changes in scope?",
              ],
            },
            {
              title: "Billing & Payment Preferences",
              questions: [
                "Do you prefer fixed-fee, time-and-material, or a hybrid billing model?",
                "Payment schedule preferences (e.g., milestone-based)?",
              ],
            },
          ],
        },
        {
          title: "Maintenance & Long-Term Vision",
          categories: [
            {
              title: "Post-Launch Support",
              questions: [
                "Do you need a Service Level Agreement (SLA)?",
                "How will you handle updates and bug fixes?",
              ],
            },
            {
              title: "Future Development & Upgrades",
              questions: [
                "Do you anticipate adding features later?",
                "Should scalability be built into the initial design?",
              ],
            },
          ],
        },
        {
          title: "Additional Requirements or Constraints",
          categories: [
            {
              title: "Legal or Compliance Constraints",
              questions: [
                "Are there any specific legal agreements (e.g., NDAs, IP rights) we need to be aware of?",
                "Are there industry-specific regulations we need to follow?",
                "Do you have specific vendor or partner restrictions?",
                "Do you have a preferred contract or NDA template?",
              ],
            },
          ],
        },
        {
          title: "Additional Information",
          categories: [
            {
              title: "Miscellaneous",
              questions: [
                "Is there anything else you'd like to share about the project?",
              ],
            },
          ],
        },
      ];

      for (const step of steps) {
        const createdStep = await WizardStep.create({
          title: step.title,
          stepNumber: steps.indexOf(step) + 1, // Increment step number dynamically
        });
  
        for (const category of step.categories) {
          const createdCategory = await Category.create({
            title: category.title,
            description: "",
            step_id: createdStep.id, // Ensure the foreign key matches your models
          });
  
          for (const question of category.questions) {
            await Question.create({
              questionText: question, // Ensure the field matches the Question model
              category_id: createdCategory.id, // Ensure the foreign key matches your models
              questionType: "text", // Default question type
              isRequired: true, // Default to required for now
              sortOrder: category.questions.indexOf(question) + 1, // Dynamically set sort order
            });
          }
        }
      }
  
      console.log("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  };
  

seedData();
