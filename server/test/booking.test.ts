import { testRequest, testData, cleanup } from './setup';
import { expect } from 'chai';

describe('Booking Tests', () => {
  let userToken: string;
  let vehicleId: string;
  let slotId: string;

  before(async () => {
    await cleanup();
    
    // Create test user
    const signupResponse = await testRequest
      .post('/api/auth/signup')
      .send(testData.user);
    userToken = signupResponse.body.token;

    // Register vehicle
    const vehicleResponse = await testRequest
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testData.vehicle);
    vehicleId = vehicleResponse.body.id;

    // Create slot
    const slotResponse = await testRequest
      .post('/api/admin/slots')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testData.slot);
    slotId = slotResponse.body.id;
  });

  after(async () => {
    await cleanup();
  });

  it('should create booking', async () => {
    const bookingData = {
      slotId,
      vehicleId,
      paymentMethod: 'cash'
    };

    const response = await testRequest
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(bookingData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.status).to.equal('active');
  });

  it('should get user bookings', async () => {
    const response = await testRequest
      .get('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should fail to create booking for unavailable slot', async () => {
    const bookingData = {
      slotId,
      vehicleId,
      paymentMethod: 'cash'
    };

    const response = await testRequest
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(bookingData);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error');
  });

  it('should checkout booking', async () => {
    const bookingsResponse = await testRequest
      .get('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`);

    const bookingId = bookingsResponse.body[0].id;

    const response = await testRequest
      .post(`/api/bookings/${bookingId}/checkout`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('completed');
  });

  it('should fail to checkout already completed booking', async () => {
    const bookingsResponse = await testRequest
      .get('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`);

    const bookingId = bookingsResponse.body[0].id;

    const response = await testRequest
      .post(`/api/bookings/${bookingId}/checkout`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error');
  });
});
