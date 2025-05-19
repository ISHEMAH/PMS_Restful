import { testRequest, testData, cleanup } from './setup';
import { expect } from 'chai';

describe('Vehicle Tests', () => {
  let userToken: string;

  before(async () => {
    await cleanup();
    
    // Create test user and get token
    const signupResponse = await testRequest
      .post('/api/auth/signup')
      .send(testData.user);
    userToken = signupResponse.body.token;
  });

  after(async () => {
    await cleanup();
  });

  it('should register vehicle', async () => {
    const response = await testRequest
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testData.vehicle);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.licensePlate).to.equal(testData.vehicle.licensePlate);
  });

  it('should get user vehicles', async () => {
    const response = await testRequest
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should fail to register duplicate vehicle', async () => {
    const response = await testRequest
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testData.vehicle);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error');
  });

  it('should update vehicle', async () => {
    const updateData = {
      make: 'Updated Make',
      model: 'Updated Model'
    };

    const vehiclesResponse = await testRequest
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    const vehicleId = vehiclesResponse.body[0].id;

    const response = await testRequest
      .patch(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData);

    expect(response.status).to.equal(200);
    expect(response.body.make).to.equal(updateData.make);
    expect(response.body.model).to.equal(updateData.model);
  });

  it('should delete vehicle', async () => {
    const vehiclesResponse = await testRequest
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    const vehicleId = vehiclesResponse.body[0].id;

    const response = await testRequest
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
  });
});
