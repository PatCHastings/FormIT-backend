// seedData.js
const { WizardStep, Category, Question } = require("./models");

const seedData = async () => {
  try {
    // 1) Define an array of wizard steps, each with categories and questions
    //    We'll interleave general steps with service-specific steps

    const stepsData = [
      /************************************************
       * GENERAL STEPS
       ************************************************/
      {
        title: "Company & Stakeholder Information",
        serviceType: "general",
        stepNumber: 1,
        categories: [
          {
            title: "Company Background",
            description: "",
            questions: [
              {
                text: "What does your company do?",
                isRequired: true,
              },
              {
                text: "Who are your primary customers or end users?",
                isRequired: true,
              },
            ],
          },
          {
            title: "Contact Details & Stakeholders",
            description: "",
            questions: [
              {
                text: "Who will be our primary point of contact?",
                isRequired: true,
              },
              {
                text: "Are there other key stakeholders or decision-makers?",
                isRequired: false,
              },
            ],
          },
        ],
      },
      {
        title: "Budget & Timeline",
        serviceType: "general",
        stepNumber: 2,
        categories: [
          {
            title: "Budget Range",
            description: "",
            questions: [
              {
                text: "What is your estimated or approved budget range?",
                isRequired: true,
              },
              {
                text: "Do you have contingency funds for changes in scope or timeline?",
                isRequired: false,
              },
            ],
          },
          {
            title: "Timeline & Milestones",
            description: "",
            questions: [
              {
                text: "Is there an ideal launch or completion date?",
                isRequired: true,
              },
              {
                text: "How often do you want progress updates or demos?",
                isRequired: false,
              },
            ],
          },
        ],
      },
      {
        title: "Additional Requirements",
        serviceType: "general",
        stepNumber: 3,
        categories: [
          {
            title: "Legal or Compliance Constraints",
            description: "",
            questions: [
              {
                text: "Any specific legal agreements or industry regulations we must follow?",
                isRequired: false,
              },
              {
                text: "Do you have a preferred contract or NDA template?",
                isRequired: false,
              },
            ],
          },
          {
            title: "Post-Launch Support",
            description: "",
            questions: [
              {
                text: "Do you need ongoing maintenance or SLA?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      /************************************************
       * SERVICE-SPECIFIC STEPS
       ************************************************/

      // NEW APPLICATION DEVELOPMENT
      {
        title: "New App Scope & MVP",
        serviceType: "new_app",
        stepNumber: 1,
        categories: [
          {
            title: "MVP Features",
            description: "",
            questions: [
              {
                text: "What essential features must the MVP (minimum viable product) include?",
                isRequired: true,
              },
              {
                text: "Who are your primary target users for this MVP?",
                isRequired: true,
              },
            ],
          },
          {
            title: "Technical Preferences",
            description: "",
            questions: [
              {
                text: "Any preferred tech stack (Node, Python, etc.)?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // WEBSITE DEVELOPMENT
      {
        title: "Website Requirements",
        serviceType: "website",
        stepNumber: 1,
        categories: [
          {
            title: "Website Purpose & Content",
            description: "",
            questions: [
              {
                text: "Is this e-commerce, portfolio, or business site?",
                isRequired: true,
              },
              {
                text: "Do you have brand guidelines or style preferences?",
                isRequired: false,
              },
            ],
          },
          {
            title: "Design & Navigation",
            description: "",
            questions: [
              {
                text: "Any reference sites or design inspiration?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // WEB HOSTING SERVICES
      {
        title: "Hosting & Domain Setup",
        serviceType: "hosting",
        stepNumber: 1,
        categories: [
          {
            title: "Hosting Preferences",
            description: "",
            questions: [
              {
                text: "Do you already have a hosting provider?",
                isRequired: false,
              },
              {
                text: "What level of control (shared, VPS, dedicated)?",
                isRequired: false,
              },
            ],
          },
          {
            title: "Domain & DNS",
            description: "",
            questions: [
              {
                text: "Do you have a domain purchased already?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // CLOUD SOLUTIONS
      {
        title: "Cloud Architecture & Deployment",
        serviceType: "cloud",
        stepNumber: 1,
        categories: [
          {
            title: "Cloud Provider & Environment",
            description: "",
            questions: [
              {
                text: "Which cloud provider do you prefer (AWS, Azure, GCP)?",
                isRequired: true,
              },
            ],
          },
          {
            title: "Infrastructure & Scalability",
            description: "",
            questions: [
              {
                text: "How many users or requests do you anticipate?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // BUG FIXES & DEBUGGING
      {
        title: "Current Application Issues",
        serviceType: "bug_fixes",
        stepNumber: 1,
        categories: [
          {
            title: "Existing Codebase",
            description: "",
            questions: [
              {
                text: "Where is your code repository?",
                isRequired: true,
              },
              {
                text: "Which frameworks or languages are used?",
                isRequired: false,
              },
            ],
          },
          {
            title: "Issue Details",
            description: "",
            questions: [
              {
                text: "Describe the main bugs or errors you're facing.",
                isRequired: true,
              },
            ],
          },
        ],
      },

      // UI/UX ENHANCEMENTS
      {
        title: "UI/UX Improvement Scope",
        serviceType: "ui_ux",
        stepNumber: 1,
        categories: [
          {
            title: "Current Design",
            description: "",
            questions: [
              {
                text: "Do you have an existing style guide or design system?",
                isRequired: false,
              },
              {
                text: "What are the main user pain points?",
                isRequired: true,
              },
            ],
          },
          {
            title: "Desired Enhancements",
            description: "",
            questions: [
              {
                text: "Are you aiming for a rebrand or just incremental improvements?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // DATABASE DESIGN & OPTIMIZATION
      {
        title: "Database Requirements",
        serviceType: "database",
        stepNumber: 1,
        categories: [
          {
            title: "Current/Planned Database",
            description: "",
            questions: [
              {
                text: "Which database are you currently using or planning to use?",
                isRequired: true,
              },
            ],
          },
          {
            title: "Optimization Goals",
            description: "",
            questions: [
              {
                text: "Any performance bottlenecks or high query times?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // API INTEGRATION
      {
        title: "API Integration Scope",
        serviceType: "api_integration",
        stepNumber: 1,
        categories: [
          {
            title: "External Services",
            description: "",
            questions: [
              {
                text: "Which third-party APIs do you need (e.g., Stripe, Maps)?",
                isRequired: true,
              },
            ],
          },
          {
            title: "Data Flow & Security",
            description: "",
            questions: [
              {
                text: "What data do you need to send or retrieve?",
                isRequired: true,
              },
            ],
          },
        ],
      },

      // MOBILE APP DEVELOPMENT
      {
        title: "Mobile App Scope",
        serviceType: "mobile",
        stepNumber: 1,
        categories: [
          {
            title: "Platforms & Features",
            description: "",
            questions: [
              {
                text: "Which platforms are you targeting (iOS, Android, cross-platform)?",
                isRequired: true,
              },
              {
                text: "Do you need push notifications or offline capabilities?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // ONGOING MAINTENANCE
      {
        title: "Maintenance & Support Plan",
        serviceType: "maintenance",
        stepNumber: 1,
        categories: [
          {
            title: "Coverage",
            description: "",
            questions: [
              {
                text: "Which areas need maintenance (backend, frontend)?",
                isRequired: false,
              },
            ],
          },
          {
            title: "Retainer & SLAs",
            description: "",
            questions: [
              {
                text: "Are you looking for a monthly retainer or on-demand support?",
                isRequired: false,
              },
            ],
          },
        ],
      },

      // AI/ML INTEGRATION
      {
        title: "AI/ML Feature Requirements",
        serviceType: "ai_ml",
        stepNumber: 1,
        categories: [
          {
            title: "AI Goals",
            description: "",
            questions: [
              {
                text: "Which AI/ML features do you want (chatbots, analytics)?",
                isRequired: true,
              },
            ],
          },
          {
            title: "Tools & Deployment",
            description: "",
            questions: [
              {
                text: "Which frameworks (TensorFlow, PyTorch) are acceptable?",
                isRequired: false,
              },
            ],
          },
        ],
      },
    ];

    // 2) Insert data into DB
    //    For each wizard step -> create step -> create categories -> create questions
    for (const stepObj of stepsData) {
      const createdStep = await WizardStep.create({
        title: stepObj.title,
        stepNumber: stepObj.stepNumber,
        description: "", // placeholder
        serviceType: stepObj.serviceType, // Use camelCase
      });
    
      for (const [catIndex, category] of stepObj.categories.entries()) {
        const createdCategory = await Category.create({
          title: category.title,
          description: category.description || "",
          sortOrder: catIndex + 1,
          step_id: createdStep.id, // link to WizardStep
        });
    
        for (const [qIndex, question] of category.questions.entries()) {
          await Question.create({
            questionText: question.text,
            questionType: question.questionType || "text",
            isRequired: question.isRequired,
            helpText: question.helpText || "",
            sortOrder: qIndex + 1,
            category_id: createdCategory.id, // link to Category
          });
        }
      }
    }

    console.log("Database seeded successfully!");
    process.exit(0); // Exit the script
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
