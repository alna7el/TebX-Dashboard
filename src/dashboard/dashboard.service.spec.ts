import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Appointment } from '../appointments/schema/appointments.schema';
import { Patient } from '../patients/schema/patients.schema';
import { User } from '../users/schemas/user.schema';
import { Clinic } from '../clinics/schemas/clinic.schema';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockAppointmentModel: any;
  let mockPatientModel: any;
  let mockUserModel: any;
  let mockClinicModel: any;

  beforeEach(async () => {
    // Mock models with basic methods
    mockAppointmentModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      updateMany: jest.fn(),
      save: jest.fn(),
    };

    mockPatientModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };

    mockUserModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };

    mockClinicModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Appointment.name),
          useValue: mockAppointmentModel,
        },
        {
          provide: getModelToken(Patient.name),
          useValue: mockPatientModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Clinic.name),
          useValue: mockClinicModel,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClinicOverview', () => {
    it('should return clinic overview data', async () => {
      const clinicId = '507f1f77bcf86cd799439011';
      const mockClinic = { _id: clinicId, name: 'Test Clinic' };
      const mockAppointments = [
        { status: 'Completed', patient_arrival_time: new Date() },
        { status: 'Booked', patient_arrival_time: new Date() },
        { status: 'In-progress', patient_arrival_time: new Date() },
      ];

      mockClinicModel.findById.mockResolvedValue(mockClinic);
      mockAppointmentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockAppointments),
      });
      mockUserModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getClinicOverview(clinicId);

      expect(result).toBeDefined();
      expect(result.clinicId).toBe(clinicId);
      expect(result.clinicName).toBe('Test Clinic');
      expect(result.appointmentSummary).toBeDefined();
      expect(result.patientFlow).toBeDefined();
      expect(result.doctorStatus).toBeDefined();
    });
  });

  describe('checkInPatient', () => {
    it('should successfully check in a patient', async () => {
      const checkInDto = {
        patientId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
        notes: 'Test check-in',
      };

      const mockAppointment = {
        _id: checkInDto.appointmentId,
        patient_arrival_time: null,
        notes: '',
        save: jest.fn().mockResolvedValue(true),
      };

      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);

      const result = await service.checkInPatient(checkInDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Patient checked in successfully');
      expect(mockAppointment.save).toHaveBeenCalled();
      expect(mockAppointment.patient_arrival_time).toBeDefined();
    });

    it('should return error if appointment not found', async () => {
      const checkInDto = {
        patientId: '507f1f77bcf86cd799439011',
        appointmentId: '507f1f77bcf86cd799439012',
      };

      mockAppointmentModel.findById.mockResolvedValue(null);

      const result = await service.checkInPatient(checkInDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Appointment not found');
    });
  });

  describe('quickPatientLookup', () => {
    it('should return patient search results', async () => {
      const lookupDto = {
        searchTerm: 'John',
        clinicId: '507f1f77bcf86cd799439011',
        limit: 5,
      };

      const mockPatients = [
        {
          _id: '507f1f77bcf86cd799439012',
          first_name_ar: 'جون',
          last_name_ar: 'دو',
          first_name_en: 'John',
          last_name_en: 'Doe',
          phone: '1234567890',
          medical_file_number: 'MRN001',
        },
      ];

      mockPatientModel.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockPatients),
      });

      mockAppointmentModel.findOne.mockResolvedValue(null);

      const result = await service.quickPatientLookup(lookupDto);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].patientId).toBe('507f1f77bcf86cd799439012');
      expect(result[0].fullNameEn).toBe('John Doe');
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should successfully update multiple appointments', async () => {
      const bulkUpdateDto = {
        appointmentIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        status: 'Cancelled',
        reason: 'Emergency closure',
      };

      const mockUpdateResult = {
        modifiedCount: 2,
      };

      mockAppointmentModel.updateMany.mockResolvedValue(mockUpdateResult);

      const result = await service.bulkUpdateStatus(bulkUpdateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully updated 2 appointments');
      expect(result.data.modifiedCount).toBe(2);
    });
  });

  describe('getWaitingRoom', () => {
    it('should return waiting room data', async () => {
      const clinicId = '507f1f77bcf86cd799439011';
      
      const mockWaitingAppointments = [
        {
          _id: '507f1f77bcf86cd799439012',
          patient: {
            _id: '507f1f77bcf86cd799439013',
            first_name_ar: 'أحمد',
            last_name_ar: 'محمد',
            first_name_en: 'Ahmed',
            last_name_en: 'Mohammed',
            medical_file_number: 'MRN001',
          },
          time: '09:00',
          patient_arrival_time: new Date(),
          status: 'Booked',
          doctor: { firstName: 'Dr. Sarah', lastName: 'Johnson' },
          service: { name: 'Consultation' },
        },
      ];

      mockAppointmentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockWaitingAppointments),
      });

      mockAppointmentModel.countDocuments.mockResolvedValue(1);

      const result = await service.getWaitingRoom(clinicId);

      expect(result).toBeDefined();
      expect(result.clinicId).toBe(clinicId);
      expect(result.totalInQueue).toBe(1);
      expect(result.queue).toBeDefined();
      expect(result.queue.length).toBe(1);
    });
  });

  describe('createEmergencyBooking', () => {
    it('should create an emergency appointment', async () => {
      const emergencyDto = {
        patientId: '507f1f77bcf86cd799439011',
        clinicId: '507f1f77bcf86cd799439012',
        branchId: '507f1f77bcf86cd799439013',
        serviceId: '507f1f77bcf86cd799439014',
        doctorId: '507f1f77bcf86cd799439015',
        reason: 'Severe pain',
        notes: 'Patient needs immediate attention',
        priority: 'urgent' as 'urgent',
      };

      const mockNewAppointment = {
        _id: '507f1f77bcf86cd799439016',
        ...emergencyDto,
        save: jest.fn().mockResolvedValue(true),
      };

      mockAppointmentModel.prototype = mockNewAppointment;
      mockAppointmentModel.prototype.save = jest.fn().mockResolvedValue(mockNewAppointment);

      const result = await service.createEmergencyBooking(emergencyDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Emergency appointment created successfully');
      expect(result.affectedIds).toBeDefined();
    });
  });

  describe('performOneClickOperation', () => {
    it('should perform mark-present operation successfully', async () => {
      const operationDto = {
        operation: 'mark-present' as 'mark-present',
        appointmentId: '507f1f77bcf86cd799439011',
        reason: 'Patient arrived',
      };

      const mockAppointment = {
        _id: operationDto.appointmentId,
        status: 'Booked',
        patient_arrival_time: null,
        notes: '',
        save: jest.fn().mockResolvedValue(true),
      };

      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);

      const result = await service.performOneClickOperation(operationDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Operation 'mark-present' completed successfully");
      expect(mockAppointment.patient_arrival_time).toBeDefined();
      expect(mockAppointment.save).toHaveBeenCalled();
    });

    it('should return error if appointment not found', async () => {
      const operationDto = {
        operation: 'cancel' as 'cancel',
        appointmentId: '507f1f77bcf86cd799439011',
        reason: 'Patient request',
      };

      mockAppointmentModel.findById.mockResolvedValue(null);

      const result = await service.performOneClickOperation(operationDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Appointment not found');
    });

    it('should validate reschedule operation parameters', async () => {
      const operationDto = {
        operation: 'reschedule' as 'reschedule',
        appointmentId: '507f1f77bcf86cd799439011',
        reason: 'Doctor unavailable',
      };

      const mockAppointment = {
        _id: operationDto.appointmentId,
        status: 'Booked',
        save: jest.fn().mockResolvedValue(true),
      };

      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);

      const result = await service.performOneClickOperation(operationDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('New date and time are required for rescheduling');
    });
  });

  describe('getQueueAnalytics', () => {
    it('should return queue analytics data', async () => {
      const clinicId = '507f1f77bcf86cd799439011';
      
      const mockAppointments = [
        { 
          status: 'Completed',
          patient_arrival_time: new Date()
        },
        {
          status: 'Booked',
          patient_arrival_time: new Date()
        }
      ];

      mockAppointmentModel.find.mockResolvedValue(mockAppointments);

      const result = await service.getQueueAnalytics(clinicId);

      expect(result).toBeDefined();
      expect(result.clinicId).toBe(clinicId);
      expect(result.hourlyQueueData).toBeDefined();
      expect(result.totalPatientsServed).toBe(1); // One completed appointment
    });
  });
});
