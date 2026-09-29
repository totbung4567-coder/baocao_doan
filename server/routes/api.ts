import { Router } from 'express';
import {
  authController,
  roomController,
  tenantController,
  contractController,
  utilityController,
  invoiceController,
  paymentController,
  notificationController,
  maintenanceController,
  statsController,
} from '../controllers';

const router = Router();

// Auth routes
router.post('/auth/login', authController.login);
router.get('/auth/users', authController.getUsers);

// Rooms routes
router.get('/rooms', roomController.getAll);
router.get('/rooms/:id', roomController.getById);
router.post('/rooms', roomController.create);
router.put('/rooms/:id', roomController.update);
router.delete('/rooms/:id', roomController.delete);

// Tenants routes
router.get('/tenants', tenantController.getAll);
router.post('/tenants', tenantController.create);
router.put('/tenants/:id', tenantController.update);
router.delete('/tenants/:id', tenantController.delete);

// Contracts routes
router.get('/contracts', contractController.getAll);
router.post('/contracts', contractController.create);
router.put('/contracts/:id', contractController.update);
router.delete('/contracts/:id', contractController.delete);

// Utilities routes
router.get('/utilities/electricity', utilityController.getElectricity);
router.post('/utilities/electricity', utilityController.recordElectricity);
router.get('/utilities/water', utilityController.getWater);
router.post('/utilities/water', utilityController.recordWater);

// Invoices routes
router.get('/invoices', invoiceController.getAll);
router.post('/invoices', invoiceController.create);
router.put('/invoices/:id', invoiceController.update);
router.delete('/invoices/:id', invoiceController.delete);

// Payments routes
router.get('/payments', paymentController.getAll);
router.post('/payments', paymentController.create);

// Notifications routes
router.get('/notifications', notificationController.getAll);
router.post('/notifications', notificationController.create);

// Maintenance routes
router.get('/maintenance', maintenanceController.getAll);
router.post('/maintenance', maintenanceController.create);
router.patch('/maintenance/:id', maintenanceController.updateStatus);

// Stats routes
router.get('/stats', statsController.getStats);

export default router;
