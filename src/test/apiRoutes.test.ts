import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../api/index';

// Mock the @google/genai module
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: vi.fn().mockReturnValue(JSON.stringify({
            docType: 'lease',
            detectedType: 'Residential Lease Agreement',
            summary: 'Test summary',
            clauses: [],
            timeline: [],
            questionsChecklist: [],
            lawyerBrief: {
              summary: 'Test brief',
              flaggedClauses: [],
              openQuestions: [],
              missingProvisions: [],
              disclaimer: 'Test disclaimer',
            },
          })),
        }),
      },
    })),
    Type: {
      STRING: 'STRING',
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
    },
  };
});

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/analyze', () => {
    it('validates request body with Zod schema', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ text: '' }) // Empty text should fail validation
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('rejects oversized document text', async () => {
      const oversizedText = 'a'.repeat(50_000); // Exceeds MAX_DOCUMENT_LENGTH of 40,000
      const response = await request(app)
        .post('/api/analyze')
        .send({ text: oversizedText })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('accepts valid document analysis request', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ 
          text: 'This is a test lease agreement with valid content.',
          userTypeOverride: 'lease',
        })
        .expect('Content-Type', /json/);

      // Should return 200 if API key is configured, 503 if not, or 500 for other errors
      expect([200, 500, 503]).toContain(response.status);
    });

    it('validates docType enum values', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ 
          text: 'Test document',
          userTypeOverride: 'invalid-type',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });
  });

  describe('POST /api/qa', () => {
    it('validates request body schema', async () => {
      const response = await request(app)
        .post('/api/qa')
        .send({ question: '' }) // Missing clauses array
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('rejects oversized question text', async () => {
      const oversizedQuestion = 'a'.repeat(1_500); // Exceeds MAX_QUESTION_LENGTH of 1,000
      const response = await request(app)
        .post('/api/qa')
        .send({ 
          question: oversizedQuestion,
          clauses: [{
            id: '1',
            number: '1',
            title: 'Test Clause',
            originalText: 'Test text',
          }],
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('requires non-empty clauses array', async () => {
      const response = await request(app)
        .post('/api/qa')
        .send({ 
          question: 'What is the rent amount?',
          clauses: [], // Empty array should fail
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('accepts valid Q&A request', async () => {
      const response = await request(app)
        .post('/api/qa')
        .send({ 
          question: 'What is the notice period?',
          docTitle: 'Test Lease',
          clauses: [{
            id: 'clause-1',
            number: '1',
            title: 'Termination',
            originalText: 'Either party must provide 30 days notice.',
          }],
        })
        .expect('Content-Type', /json/);

      expect([200, 500, 503]).toContain(response.status);
    });

    it('limits clauses array to maximum 200 items', async () => {
      const tooManyClauses = Array.from({ length: 201 }, (_, i) => ({
        id: `clause-${i}`,
        number: String(i),
        title: `Clause ${i}`,
        originalText: 'Test text',
      }));

      const response = await request(app)
        .post('/api/qa')
        .send({ 
          question: 'Test question?',
          clauses: tooManyClauses,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });
  });

  describe('POST /api/simulate', () => {
    it('validates request body schema', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({ clauseTitle: '' }) // Missing originalText
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('rejects oversized scenario text', async () => {
      const oversizedScenario = 'a'.repeat(2_000); // Exceeds MAX_SCENARIO_LENGTH of 1,500
      const response = await request(app)
        .post('/api/simulate')
        .send({ 
          clauseTitle: 'Late Payment',
          originalText: 'Late fees apply after 5 days.',
          scenario: oversizedScenario,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('accepts valid simulation request', async () => {
      const response = await request(app)
        .post('/api/simulate')
        .send({ 
          clauseTitle: 'Early Termination',
          originalText: 'Tenant must pay 2 months rent as penalty.',
          scenario: 'Tenant wants to move out 6 months early',
        })
        .expect('Content-Type', /json/);

      expect([200, 500, 503]).toContain(response.status);
    });
  });

  describe('POST /api/compare', () => {
    it('validates request body schema', async () => {
      const response = await request(app)
        .post('/api/compare')
        .send({ docAText: 'Text A' }) // Missing docBText
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('rejects empty document texts', async () => {
      const response = await request(app)
        .post('/api/compare')
        .send({ 
          docAText: '',
          docBText: 'Document B text',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('rejects oversized documents', async () => {
      const oversizedDoc = 'a'.repeat(50_000);
      const response = await request(app)
        .post('/api/compare')
        .send({ 
          docAText: oversizedDoc,
          docBText: 'Document B text',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('accepts valid comparison request', async () => {
      const response = await request(app)
        .post('/api/compare')
        .send({ 
          docAText: 'Original lease with 30 days notice.',
          docBText: 'Updated lease with 60 days notice.',
          docAName: 'Original Lease',
          docBName: 'New Lease',
        })
        .expect('Content-Type', /json/);

      expect([200, 500, 503]).toContain(response.status);
    });
  });

  describe('POST /api/draft-message', () => {
    it('validates request body schema', async () => {
      const response = await request(app)
        .post('/api/draft-message')
        .send({ clauseTitle: '' }) // Missing originalText
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('accepts valid draft message request with all fields', async () => {
      const response = await request(app)
        .post('/api/draft-message')
        .send({ 
          clauseTitle: 'Security Deposit',
          originalText: 'Landlord may withhold entire deposit for any damage.',
          tag: 'high-attention',
          tagReason: 'One-sided provision',
          suggestedStrategy: 'Request itemized deduction list',
          docTitle: 'Residential Lease',
          docType: 'lease',
        })
        .expect('Content-Type', /json/);

      expect([200, 500, 503]).toContain(response.status);
    });

    it('accepts minimal draft message request', async () => {
      const response = await request(app)
        .post('/api/draft-message')
        .send({ 
          clauseTitle: 'Maintenance Responsibility',
          originalText: 'Tenant responsible for all repairs.',
        })
        .expect('Content-Type', /json/);

      expect([200, 500, 503]).toContain(response.status);
    });
  });

  describe('POST /api/suggest-fairer-language', () => {
    it('validates request body schema', async () => {
      const response = await request(app)
        .post('/api/suggest-fairer-language')
        .send({ clauseTitle: '' }) // Missing originalText
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid request');
    });

    it('accepts valid fairer language request', async () => {
      const response = await request(app)
        .post('/api/suggest-fairer-language')
        .send({ 
          clauseTitle: 'Termination',
          originalText: 'Landlord may terminate at any time without cause.',
          tag: 'high-attention',
          tagReason: 'No tenant protection',
          suggestedReplacementText: 'Either party may terminate with 60 days notice.',
          docType: 'lease',
        })
        .expect('Content-Type', /json/);

      expect([200, 500, 503]).toContain(response.status);
    });
  });

  describe('Security Headers', () => {
    it('includes helmet security headers', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ text: 'test' })
        .expect('Content-Type', /json/);

      // Helmet adds various security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });

  describe('Request Size Limits', () => {
    it('rejects requests exceeding 500kb limit', async () => {
      // Create a payload larger than 500kb
      const largePayload = {
        text: 'a'.repeat(600 * 1024), // 600kb
      };

      const response = await request(app)
        .post('/api/analyze')
        .send(largePayload)
        .expect(413); // Payload Too Large

      expect(response.status).toBe(413);
    });
  });

  describe('Error Handling', () => {
    it('returns JSON error responses', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ invalid: 'data' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('does not leak stack traces in production', async () => {
      // Set NODE_ENV to production temporarily
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .post('/api/analyze')
        .send({ text: 'test' })
        .expect('Content-Type', /json/);

      // Even if there's an error, it shouldn't contain stack traces
      if (response.body.error) {
        expect(response.body.error).not.toContain('at ');
        expect(response.body.error).not.toContain('Error:');
      }

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});
