import { testRequest, testData, cleanup } from './setup';
import { expect } from 'chai';

describe('Authentication Tests', () => {
  let adminToken: string;
  let userToken: string;

  before(async () => {
    // Cleanup before tests
    await cleanup();
  });

  after(async () => {
    // Cleanup after tests
    await cleanup();
  });

  // Test user registration
  describe('User Registration', () => {
    it('should register a new user', async () => {
      const response = await testRequest
        .post('/api/auth/signup')
        .send({
          name: testData.user.name,
          email: testData.user.email,
          password: testData.user.password,
          role: testData.user.role
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('token');
    });

    it('should not register with existing email', async () => {
      const response = await testRequest
        .post('/api/auth/signup')
        .send({
          name: testData.user.name,
          email: testData.user.email,
          password: testData.user.password,
          role: testData.user.role
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });
  });

  // Test admin creation
  describe('Admin Creation', () => {
    it('should create a new admin', async () => {
      const response = await testRequest
        .post('/api/auth/create-admin')
        .send({
          name: testData.admin.name,
          email: testData.admin.email,
          password: testData.admin.password,
          role: testData.admin.role
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('token');
    });

    it('should not create admin with existing email', async () => {
      const response = await testRequest
        .post('/api/auth/create-admin')
        .send({
          name: testData.admin.name,
          email: testData.admin.email,
          password: testData.admin.password,
          role: testData.admin.role
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });
  });

  // Test user login
  describe('User Login', () => {
    it('should login with correct credentials', async () => {
      const response = await testRequest
        .post('/api/auth/login')
        .send({
          email: testData.user.email,
          password: testData.user.password
        });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
    });

    it('should not login with incorrect password', async () => {
      const response = await testRequest
        .post('/api/auth/login')
        .send({
          email: testData.user.email,
          password: 'wrongpassword'
        });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error');
    });

    it('should not login with non-existent email', async () => {
      const response = await testRequest
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testData.user.password
        });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error');
    });
  });

  // Test admin login
  describe('Admin Login', () => {
    it('should login admin with correct credentials', async () => {
      const response = await testRequest
        .post('/api/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password
        });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
    });

    it('should not login admin with incorrect password', async () => {
      const response = await testRequest
        .post('/api/auth/login')
        .send({
          email: testData.admin.email,
          password: 'wrongpassword'
        });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error');
    });
  });
});
