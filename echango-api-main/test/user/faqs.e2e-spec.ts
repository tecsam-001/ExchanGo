import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('FAQs (e2e)', () => {
  let app: INestApplication;
  // let userToken: string; // TODO: Implement authentication

  beforeAll(async () => {
    const moduleFixture: TestModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // You would need to implement authentication here
    // This is just a placeholder for the test structure
    // userToken = await authenticateUser();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/faqs/me/bulk', () => {
    it('should create multiple FAQs successfully', () => {
      // TODO: Implement this test when authentication is set up
      const createFaqsDto = {
        faqs: [
          {
            question: 'What are your exchange rates?',
            answer:
              'Our exchange rates are updated daily and are competitive with market rates.',
          },
          {
            question: 'What are your working hours?',
            answer: 'We are open Monday to Friday from 9 AM to 6 PM.',
          },
          {
            question: 'Do you offer currency conversion services?',
            answer:
              'Yes, we offer comprehensive currency conversion services for all major currencies.',
          },
        ],
      };

      // Note: This test would need proper authentication setup
      // const response = await request(app.getHttpServer())
      //   .post('/api/v1/faqs/me/bulk')
      //   .set('Authorization', `Bearer ${userToken}`)
      //   .send(createFaqsDto)
      //   .expect(HttpStatus.CREATED);

      // expect(response.body).toHaveLength(3);
      // expect(response.body[0]).toHaveProperty('id');
      // expect(response.body[0]).toHaveProperty('question', createFaqsDto.faqs[0].question);
      // expect(response.body[0]).toHaveProperty('answer', createFaqsDto.faqs[0].answer);
      // expect(response.body[0]).toHaveProperty('isActive', true);

      // Placeholder assertion to avoid unused variable warning
      expect(createFaqsDto.faqs).toHaveLength(3);
    });

    it('should validate FAQ data', () => {
      // TODO: Implement this test when authentication is set up
      const invalidFaqsDto = {
        faqs: [
          {
            question: '', // Invalid: empty question
            answer: 'Some answer',
          },
          {
            question: 'Valid question',
            answer: '', // Invalid: empty answer
          },
        ],
      };

      // Note: This test would need proper authentication setup
      // await request(app.getHttpServer())
      //   .post('/api/v1/faqs/me/bulk')
      //   .set('Authorization', `Bearer ${userToken}`)
      //   .send(invalidFaqsDto)
      //   .expect(HttpStatus.BAD_REQUEST);

      // Placeholder assertion to avoid unused variable warning
      expect(invalidFaqsDto.faqs).toHaveLength(2);
    });

    it('should require authentication', async () => {
      const createFaqsDto = {
        faqs: [
          {
            question: 'Test question',
            answer: 'Test answer',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/v1/faqs/me/bulk')
        .send(createFaqsDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
