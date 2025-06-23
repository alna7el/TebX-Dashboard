import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schema/appointments.schema';
import { AppointmentLog, AppointmentLogDocument } from './schema/appointment-log.schema';

@Injectable()
export class AppointmentSchedulerService {
  private readonly logger = new Logger(AppointmentSchedulerService.name);

  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(AppointmentLog.name)
    private appointmentLogModel: Model<AppointmentLogDocument>,
  ) { }

  @Cron(CronExpression.EVERY_12_HOURS)
  async handleMissedAppointments() {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const appointmentsToUpdate = await this.appointmentModel.find({
      status: 'Booked',
      $or: [
        { date: { $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
        {
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          time: { $lt: currentTime }
        }
      ]
    }).select('_id date time status').exec();

    this.logger.debug(`Found ${appointmentsToUpdate.length} appointments to update`);

    if (appointmentsToUpdate.length === 0) {
      this.logger.debug('No appointments need updating');
      return;
    }
    appointmentsToUpdate.forEach(app => {
      this.logger.debug(`Appointment ID: ${app._id}, Date: ${app.date}, Time: ${app.time}, Current Status: ${app.status}`);
    });

    const result = await this.appointmentModel.updateMany(
      {
        status: 'Booked',
        $or: [
          { date: { $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
          {
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            time: { $lt: currentTime }
          }
        ]
      },
      {
        $set: { status: 'No-show' },
      },
    );

    this.logger.debug(`Update result - Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    // Log the update with appointment IDs
    await this.appointmentLogModel.create({
      action: 'UPDATE_MISSED_APPOINTMENTS',
      description: 'Updated missed appointments to No-show status',
      affectedCount: result.modifiedCount,
      appointmentIds: appointmentsToUpdate.map(app => app._id),
      metadata: {
        timestamp: now,
        previousStatus: 'Booked',
        newStatus: 'No-show',
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        currentTime: currentTime
      }
    });

    this.logger.log(`Successfully updated ${result.modifiedCount} appointments to No-show status`);
  }
}
