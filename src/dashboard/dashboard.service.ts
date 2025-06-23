import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../appointments/schema/appointments.schema';
import { Patient } from '../patients/schema/patients.schema';
import { User } from '../users/schemas/user.schema';
import { Clinic } from '../clinics/schemas/clinic.schema';
import { 
  ClinicOverviewDto, 
  AppointmentSummaryDto, 
  PatientFlowDto, 
  DoctorStatusDto 
} from './dto/clinic-overview.dto';
import { 
  WaitingRoomDto, 
  QueuePatientDto, 
  CheckInDto, 
  QueueAnalyticsDto 
} from './dto/queue-management.dto';
import { 
  EmergencyBookingDto, 
  BulkStatusUpdateDto, 
  QuickPatientLookupDto, 
  QuickPatientResultDto, 
  QuickActionResponseDto, 
  OneClickOperationDto 
} from './dto/quick-actions.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Clinic.name) private clinicModel: Model<Clinic>,
  ) {}

  async getClinicOverview(clinicId: string): Promise<ClinicOverviewDto> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Get clinic info
    const clinic = await this.clinicModel.findById(clinicId);
    
    // Get today's appointments
    const todayAppointments = await this.appointmentModel
      .find({
        clinic: clinicId,
        date: { $gte: startOfDay, $lt: endOfDay }
      })
      .populate('patient')
      .populate('doctor')
      .populate('service');

    // Build appointment summary
    const appointmentSummary: AppointmentSummaryDto = {
      total: todayAppointments.length,
      completed: todayAppointments.filter(apt => apt.status === 'Completed').length,
      inProgress: todayAppointments.filter(apt => apt.status === 'In-progress').length,
      booked: todayAppointments.filter(apt => apt.status === 'Booked').length,
      cancelled: todayAppointments.filter(apt => apt.status === 'Cancelled').length,
      noShow: todayAppointments.filter(apt => apt.status === 'No-show').length,
    };

    // Build patient flow
    const arrivedPatients = todayAppointments.filter(apt => apt.patient_arrival_time);
    const waitingPatients = arrivedPatients.filter(apt => apt.status === 'Booked');
    const withDoctorPatients = arrivedPatients.filter(apt => apt.status === 'In-progress');
    
    const patientFlow: PatientFlowDto = {
      waiting: waitingPatients.length,
      withDoctor: withDoctorPatients.length,
      arrivedToday: arrivedPatients.length,
      avgWaitTime: this.calculateAverageWaitTime(waitingPatients),
    };

    // Build doctor status
    const doctorStatus = await this.getDoctorStatus(clinicId, todayAppointments);

    return {
      clinicId,
      clinicName: clinic?.name || 'Unknown Clinic',
      date: startOfDay.toISOString().split('T')[0],
      appointmentSummary,
      patientFlow,
      doctorStatus,
      lastUpdated: new Date(),
    };
  }

  async getWaitingRoom(clinicId: string): Promise<WaitingRoomDto> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const waitingAppointments = await this.appointmentModel
      .find({
        clinic: clinicId,
        date: { $gte: startOfDay, $lt: endOfDay },
        status: 'Booked',
        patient_arrival_time: { $ne: null }
      })
      .populate('patient')
      .populate('doctor')
      .populate('service')
      .sort({ patient_arrival_time: 1 });

    const queue: QueuePatientDto[] = waitingAppointments.map((apt, index) => ({
      patientId: apt.patient._id.toString(),
      patientNameAr: `${apt.patient.first_name_ar} ${apt.patient.last_name_ar}`,
      patientNameEn: `${apt.patient.first_name_en} ${apt.patient.last_name_en}`,
      medicalFileNumber: apt.patient.medical_file_number || 'N/A',
      appointmentId: apt._id.toString(),
      scheduledTime: apt.time,
      arrivalTime: apt.patient_arrival_time,
      queuePosition: index + 1,
      estimatedWaitTime: this.calculateEstimatedWaitTime(index),
      status: apt.status,
      doctorName: apt.doctor ? `${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unassigned',
      serviceName: apt.service.name,
    }));

    const inProgressCount = await this.appointmentModel.countDocuments({
      clinic: clinicId,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: 'In-progress'
    });

    return {
      clinicId,
      totalInQueue: queue.length,
      currentlyServed: inProgressCount,
      averageWaitTime: this.calculateAverageWaitTime(waitingAppointments),
      queue,
      lastUpdated: new Date(),
    };
  }

  async checkInPatient(checkInDto: CheckInDto): Promise<QuickActionResponseDto> {
    try {
      const appointment = await this.appointmentModel.findById(checkInDto.appointmentId);
      
      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found',
        };
      }

      appointment.patient_arrival_time = new Date();
      if (checkInDto.notes) {
        appointment.notes = checkInDto.notes;
      }
      
      await appointment.save();

      return {
        success: true,
        message: 'Patient checked in successfully',
        data: appointment,
        affectedIds: [checkInDto.appointmentId],
      };
    } catch (error) {
      return {
        success: false,
        message: `Check-in failed: ${error.message}`,
      };
    }
  }

  async createEmergencyBooking(emergencyDto: EmergencyBookingDto): Promise<QuickActionResponseDto> {
    try {
      const newAppointment = new this.appointmentModel({
        patient: emergencyDto.patientId,
        clinic: emergencyDto.clinicId,
        branch: emergencyDto.branchId,
        service: emergencyDto.serviceId,
        doctor: emergencyDto.doctorId,
        date: new Date(),
        time: new Date().toTimeString().substring(0, 5),
        appointment_type: 'emergency',
        reason: emergencyDto.reason,
        notes: `EMERGENCY - Priority: ${emergencyDto.priority}\n${emergencyDto.notes || ''}`,
        status: 'Booked',
        is_emergency: true,
        patient_arrival_time: new Date(),
      });

      await newAppointment.save();

      return {
        success: true,
        message: 'Emergency appointment created successfully',
        data: newAppointment,
        affectedIds: [newAppointment._id.toString()],
      };
    } catch (error) {
      return {
        success: false,
        message: `Emergency booking failed: ${error.message}`,
      };
    }
  }

  async bulkUpdateStatus(bulkUpdateDto: BulkStatusUpdateDto): Promise<QuickActionResponseDto> {
    try {
      const result = await this.appointmentModel.updateMany(
        { _id: { $in: bulkUpdateDto.appointmentIds } },
        { 
          status: bulkUpdateDto.status,
          $push: {
            notes: `Bulk update: ${bulkUpdateDto.reason}${bulkUpdateDto.notes ? ` - ${bulkUpdateDto.notes}` : ''}`
          }
        }
      );

      return {
        success: true,
        message: `Successfully updated ${result.modifiedCount} appointments`,
        data: { modifiedCount: result.modifiedCount },
        affectedIds: bulkUpdateDto.appointmentIds,
      };
    } catch (error) {
      return {
        success: false,
        message: `Bulk update failed: ${error.message}`,
      };
    }
  }

  async quickPatientLookup(lookupDto: QuickPatientLookupDto): Promise<QuickPatientResultDto[]> {
    const { searchTerm, clinicId, limit = 10 } = lookupDto;
    
    const searchRegex = new RegExp(searchTerm, 'i');
    
    const patients = await this.patientModel
      .find({
        $or: [
          { first_name_ar: searchRegex },
          { last_name_ar: searchRegex },
          { first_name_en: searchRegex },
          { last_name_en: searchRegex },
          { phone: searchRegex },
          { medical_file_number: searchRegex },
        ]
      })
      .limit(limit);

    const results: QuickPatientResultDto[] = [];
    
    for (const patient of patients) {
      const lastAppointment = await this.appointmentModel
        .findOne({ patient: patient._id, clinic: clinicId })
        .sort({ date: -1 });

      const todayAppointment = await this.appointmentModel
        .findOne({
          patient: patient._id,
          clinic: clinicId,
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        });

      results.push({
        patientId: patient._id.toString(),
        fullNameAr: `${patient.first_name_ar} ${patient.last_name_ar}`,
        fullNameEn: `${patient.first_name_en} ${patient.last_name_en}`,
        phone: patient.phone,
        medicalFileNumber: patient.medical_file_number || 'N/A',
        lastAppointmentDate: lastAppointment?.date,
        hasActiveAppointment: !!todayAppointment,
        currentAppointmentStatus: todayAppointment?.status,
      });
    }

    return results;
  }

  async performOneClickOperation(operationDto: OneClickOperationDto): Promise<QuickActionResponseDto> {
    try {
      const appointment = await this.appointmentModel.findById(operationDto.appointmentId);
      
      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found',
        };
      }

      switch (operationDto.operation) {
        case 'mark-present':
          appointment.patient_arrival_time = new Date();
          break;
        case 'mark-no-show':
          appointment.status = 'No-show';
          break;
        case 'cancel':
          appointment.status = 'Cancelled';
          break;
        case 'reschedule':
          if (!operationDto.newDate || !operationDto.newTime) {
            return {
              success: false,
              message: 'New date and time are required for rescheduling',
            };
          }
          appointment.date = new Date(operationDto.newDate);
          appointment.time = operationDto.newTime;
          break;
      }

      if (operationDto.reason) {
        appointment.notes = appointment.notes 
          ? `${appointment.notes}\n${operationDto.reason}` 
          : operationDto.reason;
      }

      await appointment.save();

      return {
        success: true,
        message: `Operation '${operationDto.operation}' completed successfully`,
        data: appointment,
        affectedIds: [operationDto.appointmentId],
      };
    } catch (error) {
      return {
        success: false,
        message: `Operation failed: ${error.message}`,
      };
    }
  }

  private async getDoctorStatus(clinicId: string, todayAppointments: any[]): Promise<DoctorStatusDto[]> {
    const doctors = await this.userModel
      .find({ clinics: clinicId, role_id: { $exists: true } })
      .populate('role_id')
      .populate('speciality');

    return doctors.map(doctor => {
      const doctorAppointments = todayAppointments.filter(apt => 
        apt.doctor && apt.doctor._id.toString() === doctor._id.toString()
      );
      
      const currentPatients = doctorAppointments.filter(apt => apt.status === 'In-progress').length;
      const isAvailable = currentPatients === 0;

      return {
        doctorId: doctor._id.toString(),
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        speciality: doctor.speciality?.name || 'General',
        currentPatients,
        todayAppointments: doctorAppointments.length,
        isAvailable,
        nextAvailableSlot: isAvailable ? 'Available now' : 'After current patient',
      };
    });
  }

  private calculateAverageWaitTime(appointments: any[]): number {
    if (!appointments.length) return 0;
    
    const now = new Date();
    const totalWaitTime = appointments.reduce((sum, apt) => {
      if (apt.patient_arrival_time) {
        return sum + (now.getTime() - apt.patient_arrival_time.getTime());
      }
      return sum;
    }, 0);

    return Math.round(totalWaitTime / appointments.length / (1000 * 60)); // Convert to minutes
  }

  private calculateEstimatedWaitTime(queuePosition: number): number {
    const averageServiceTime = 20; // minutes per patient
    return queuePosition * averageServiceTime;
  }

  async getQueueAnalytics(clinicId: string): Promise<QueueAnalyticsDto> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayAppointments = await this.appointmentModel
      .find({
        clinic: clinicId,
        date: { $gte: startOfDay, $lt: endOfDay }
      });

    // Generate hourly data
    const hourlyQueueData = [];
    for (let hour = 8; hour < 18; hour++) {
      const hourStart = new Date(startOfDay.getTime() + hour * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourAppointments = todayAppointments.filter(apt => {
        if (!apt.patient_arrival_time) return false;
        return apt.patient_arrival_time >= hourStart && apt.patient_arrival_time < hourEnd;
      });

      hourlyQueueData.push({
        hour,
        queueLength: hourAppointments.length,
        avgWaitTime: this.calculateAverageWaitTime(hourAppointments),
      });
    }

    const completedAppointments = todayAppointments.filter(apt => apt.status === 'Completed');
    const maxQueueLength = Math.max(...hourlyQueueData.map(h => h.queueLength), 0);
    const peakHour = hourlyQueueData.find(h => h.queueLength === maxQueueLength);

    return {
      clinicId,
      date: startOfDay.toISOString().split('T')[0],
      peakQueueTime: peakHour ? `${peakHour.hour}:00` : 'N/A',
      maxQueueLength,
      averageServiceTime: 20, // This could be calculated from actual data
      totalPatientsServed: completedAppointments.length,
      hourlyQueueData,
    };
  }
}
