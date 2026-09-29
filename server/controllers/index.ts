import { Request, Response } from 'express';
import {
  authService,
  roomService,
  tenantService,
  contractService,
  utilityService,
  invoiceService,
  paymentService,
  notificationService,
  maintenanceService,
  statsService,
} from '../services';

export const authController = {
  login: (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }
    const result = authService.login(username, password);
    if (!result) {
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' });
    }
    res.json({ success: true, data: result });
  },
  getUsers: (_req: Request, res: Response) => {
    res.json({ success: true, data: authService.getUsers() });
  },
};

export const roomController = {
  getAll: (req: Request, res: Response) => {
    const floor = req.query.floor ? Number(req.query.floor) : undefined;
    const status = req.query.status as string | undefined;
    const rooms = roomService.getAll(floor, status);
    res.json({ success: true, data: rooms });
  },
  getById: (req: Request, res: Response) => {
    const room = roomService.getById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    res.json({ success: true, data: room });
  },
  create: (req: Request, res: Response) => {
    try {
      const room = roomService.create(req.body);
      res.status(201).json({ success: true, data: room });
    } catch {
      res.status(500).json({ success: false, message: 'Lỗi khi tạo phòng mới.' });
    }
  },
  update: (req: Request, res: Response) => {
    const room = roomService.update(req.params.id, req.body);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng.' });
    res.json({ success: true, data: room });
  },
  delete: (req: Request, res: Response) => {
    const ok = roomService.delete(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng để xóa.' });
    res.json({ success: true, message: 'Đã xóa phòng thành công.' });
  },
};

export const tenantController = {
  getAll: (req: Request, res: Response) => {
    const roomId = req.query.roomId as string | undefined;
    res.json({ success: true, data: tenantService.getAll(roomId) });
  },
  create: (req: Request, res: Response) => {
    const tenant = tenantService.create(req.body);
    res.status(201).json({ success: true, data: tenant });
  },
  update: (req: Request, res: Response) => {
    const tenant = tenantService.update(req.params.id, req.body);
    if (!tenant) return res.status(404).json({ success: false, message: 'Không tìm thấy người thuê.' });
    res.json({ success: true, data: tenant });
  },
  delete: (req: Request, res: Response) => {
    const ok = tenantService.delete(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy người thuê để xóa.' });
    res.json({ success: true, message: 'Đã xóa người thuê thành công.' });
  },
};

export const contractController = {
  getAll: (_req: Request, res: Response) => {
    res.json({ success: true, data: contractService.getAll() });
  },
  create: (req: Request, res: Response) => {
    const contract = contractService.create(req.body);
    res.status(201).json({ success: true, data: contract });
  },
  update: (req: Request, res: Response) => {
    const contract = contractService.update(req.params.id, req.body);
    if (!contract) return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    res.json({ success: true, data: contract });
  },
  delete: (req: Request, res: Response) => {
    const ok = contractService.delete(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng để xóa.' });
    res.json({ success: true, message: 'Đã xóa hợp đồng.' });
  },
};

export const utilityController = {
  getElectricity: (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    res.json({ success: true, data: utilityService.getElectricity(month) });
  },
  getWater: (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    res.json({ success: true, data: utilityService.getWater(month) });
  },
  recordElectricity: (req: Request, res: Response) => {
    const reading = utilityService.recordElectricity(req.body);
    res.json({ success: true, data: reading });
  },
  recordWater: (req: Request, res: Response) => {
    const reading = utilityService.recordWater(req.body);
    res.json({ success: true, data: reading });
  },
};

export const invoiceController = {
  getAll: (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    const roomId = req.query.roomId as string | undefined;
    res.json({ success: true, data: invoiceService.getAll(month, roomId) });
  },
  create: (req: Request, res: Response) => {
    const invoice = invoiceService.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  },
  update: (req: Request, res: Response) => {
    const invoice = invoiceService.update(req.params.id, req.body);
    if (!invoice) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });
    res.json({ success: true, data: invoice });
  },
  delete: (req: Request, res: Response) => {
    const ok = invoiceService.delete(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn để xóa.' });
    res.json({ success: true, message: 'Đã xóa hóa đơn.' });
  },
};

export const paymentController = {
  getAll: (req: Request, res: Response) => {
    const invoiceId = req.query.invoiceId as string | undefined;
    res.json({ success: true, data: paymentService.getAll(invoiceId) });
  },
  create: (req: Request, res: Response) => {
    const payment = paymentService.recordPayment(req.body);
    res.status(201).json({ success: true, data: payment });
  },
};

export const notificationController = {
  getAll: (req: Request, res: Response) => {
    const roomId = req.query.roomId as string | undefined;
    res.json({ success: true, data: notificationService.getAll(roomId) });
  },
  create: (req: Request, res: Response) => {
    const notif = notificationService.create(req.body);
    res.status(201).json({ success: true, data: notif });
  },
};

export const maintenanceController = {
  getAll: (req: Request, res: Response) => {
    const roomId = req.query.roomId as string | undefined;
    res.json({ success: true, data: maintenanceService.getAll(roomId) });
  },
  create: (req: Request, res: Response) => {
    const reqItem = maintenanceService.create(req.body);
    res.status(201).json({ success: true, data: reqItem });
  },
  updateStatus: (req: Request, res: Response) => {
    const { status, adminNote } = req.body;
    const reqItem = maintenanceService.updateStatus(req.params.id, status, adminNote);
    if (!reqItem) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });
    res.json({ success: true, data: reqItem });
  },
};

export const statsController = {
  getStats: (_req: Request, res: Response) => {
    res.json({ success: true, data: statsService.getDashboardStats() });
  },
};
