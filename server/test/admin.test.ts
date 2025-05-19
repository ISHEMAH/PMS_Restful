import { testRequest, testData, cleanup } from './setup';
import { expect } from 'chai';

describe('Admin Tests', () => {
  let adminToken: string;
  let slotId: string;

  before(async () => {
    await cleanup();
    
    // Create test admin
    const signupResponse = await testRequest
      .post('/api/auth/admin/signup')
      .send(testData.admin);
    adminToken = signupResponse.body.token;
  });

  after(async () => {
    await cleanup();
  });

  it('should create slot', async () => {
    const response = await testRequest
      .post('/api/admin/slots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testData.slot);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.number).to.equal(testData.slot.number);
    slotId = response.body.id;
  });

  it('should get all slots', async () => {
    const response = await testRequest
      .get('/api/admin/slots')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should update slot', async () => {
    const updateData = {
      status: 'maintenance'
    };

    const response = await testRequest
      .patch(`/api/admin/slots/${slotId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('maintenance');
  });

  it('should delete slot', async () => {
    const response = await testRequest
      .delete(`/api/admin/slots/${slotId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
  });

  it('should get analytics', async () => {
    const response = await testRequest
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('totalBookings');
    expect(response.body).to.have.property('totalRevenue');
  });

  it('should fail to access admin routes without admin token', async () => {
    const response = await testRequest
      .get('/api/admin/slots')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).to.equal(401);
    expect(response.body).to.have.property('error');
  });
});
