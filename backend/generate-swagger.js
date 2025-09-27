const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");
const path = require("path");

// --- Centralized Swagger Options ---
// This object is now the single source of truth for your API definition.
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Inter Finder API",
      version: "1.0.0",
      description:
        "API Documentation for the Inter Finder web application. This provides a clear contract for frontend and backend teams.",
    },
    servers: [
      {
        url: process.env.SERVER_URL || "http://localhost:5000/api",
        description: "Development Server",
      },
    ],
    // --- ADDED: Reusable Component Definitions ---
    // This is where we define all the "templates" for our API.
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // --- User Schemas ---
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60c72b2f9b1d8c001f8e4a9c" },
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", example: "jane.doe@example.com" },
            role: { type: "string", enum: ["intern", "client"] },
            phone: { type: "string", example: "123-456-7890" },
          },
        },
        // --- Job Schemas ---
        Job: {
          type: "object",
          properties: {
            _id: { type: "string" },
            companyId: { 
              type: "string",
              description: "Reference to Company model"
            },
            title: { 
              type: "string", 
              example: "Frontend Developer Intern",
              required: true
            },
            type: { 
              type: "string", 
              enum: ["remote", "onsite", "hybrid"],
              required: true
            },
            location: { 
              type: "string", 
              example: "Remote",
              required: true
            },
            salary: { 
              type: "string",
              example: "$20-$30 per hour",
              required: true
            },
            duration: { 
              type: "string",
              example: "3 months",
              required: true
            },
            startDate: { 
              type: "string",
              format: "date"
            },
            deadline: { 
              type: "string",
              format: "date"
            },
            description: { 
              type: "string",
              required: true
            },
            responsibilities: { 
              type: "string",
              required: true
            },
            requirements: { 
              type: "string",
              required: true
            },
            benefits: { 
              type: "string"
            },
            status: { 
              type: "string",
              enum: ["active", "inactive", "filled", "cancelled"],
              default: "active"
            },
            views: { 
              type: "integer",
              default: 0
            },
            createdAt: {
              type: "string",
              format: "date-time"
            },
            updatedAt: {
              type: "string",
              format: "date-time"
            }
          },
        },
        // --- Review Schema ---
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            reviewer: { 
              type: 'string',
              description: 'ID of the user who created the review'
            },
            target: {
              type: 'string',
              description: 'ID of the target being reviewed (Company or Intern)'
            },
            targetModel: {
              type: 'string',
              enum: ['Company', 'Intern'],
              description: 'Type of the target being reviewed'
            },
            job: {
              type: 'string',
              description: 'Optional job ID if the review is job-specific'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating from 1 to 5'
            },
            content: {
              type: 'string',
              description: 'Review content'
            },
            direction: {
              type: 'string',
              enum: ['company_to_intern', 'intern_to_company'],
              description: 'Direction of the review (who is reviewing whom)'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              default: 'pending',
              description: 'Moderation status of the review'
            },
            adminNotes: {
              type: 'string',
              description: 'Notes from admin/moderation'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        // --- Generic Error Schema ---
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Server Error" },
          },
        },
      },
    },
    // Make bearerAuth security available globally
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the files containing OpenAPI definitions
  apis: ["./routes/*.js"],
};

try {
  // Initialize swagger-jsdoc -> returns validated swagger spec in JSON format
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  // Define the output path for the JSON file
  const outputPath = path.join(__dirname, "swagger-spec.json");

  // Write the swagger specification to a JSON file
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

  console.log(
    `✅ Swagger API specification generated successfully at ${outputPath}`
  );
} catch (error) {
  console.error("❌ Failed to generate Swagger API specification.");
  console.error(error);
}
