const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dinner Registration API',
      version: '1.0.0',
      description: 'API for managing dinner event registrations and admin operations',
      contact: {
        name: 'API Support',
        email: 'support@dinnerregistration.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Submission: {
          type: 'object',
          required: ['firstName', 'lastName', 'phoneNumber', 'email', 'referredBy'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier'
            },
            firstName: {
              type: 'string',
              maxLength: 50,
              description: 'First name of the registrant'
            },
            lastName: {
              type: 'string',
              maxLength: 50,
              description: 'Last name of the registrant'
            },
            fullName: {
              type: 'string',
              description: 'Full name (virtual field)'
            },
            phoneNumber: {
              type: 'string',
              pattern: '^[\\+]?[1-9][\\d]{0,15}$',
              description: 'Phone number'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            referredBy: {
              type: 'string',
              maxLength: 100,
              description: 'Name of the person who referred'
            },
            receiptPath: {
              type: 'string',
              description: 'Path to uploaded receipt'
            },
            receiptOriginalName: {
              type: 'string',
              description: 'Original name of uploaded receipt'
            },
            amount: {
              type: 'number',
              default: 12000,
              description: 'Registration amount'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              default: 'pending',
              description: 'Status of the submission'
            },
            referenceId: {
              type: 'string',
              description: 'Unique reference ID'
            },
            submissionDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date of submission'
            },
            reviewedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when reviewed'
            },
            reviewedBy: {
              type: 'string',
              description: 'Admin who reviewed'
            },
            rejectionReason: {
              type: 'string',
              description: 'Reason for rejection if applicable'
            }
          }
        },
        Admin: {
          type: 'object',
          required: ['username', 'email'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier'
            },
            username: {
              type: 'string',
              description: 'Admin username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Admin email'
            },
            role: {
              type: 'string',
              enum: ['admin', 'super_admin'],
              default: 'admin',
              description: 'Admin role'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Detailed error message'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};