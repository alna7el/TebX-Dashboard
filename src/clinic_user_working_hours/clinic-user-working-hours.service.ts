import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicUserWorkingHour } from './schema/clinic-user-working-hours.schema';
import { CreateClinicUserWorkingHoursDto } from './dto/create-clinic-user-working-hours.dto';
import { User } from '../users/schemas/user.schema';
import { AppointmentService } from '../appointments/appointment.service';

@Injectable()
export class ClinicUserWorkingHoursService {
  constructor(
    @InjectModel(ClinicUserWorkingHour.name)
    private clinicUserWorkingHourModel: Model<ClinicUserWorkingHour>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private appointmentService: AppointmentService,
  ) { }

  async create(createClinicUserWorkingHoursDto: CreateClinicUserWorkingHoursDto) {
    const created = new this.clinicUserWorkingHourModel(createClinicUserWorkingHoursDto);
    return created.save();
  }

  async getAvailableTimeSlots(
    userId: string,
    clinicId: string,
    date: string,
  ): Promise<string[]> {
    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const workingHours = await this.clinicUserWorkingHourModel.findOne({
      doctor_id: userId,
      clinic_id: clinicId,
    }).exec();

    if (!workingHours) {
      throw new NotFoundException(`Working hours not found for doctor ${userId} in clinic ${clinicId}`);
    }

    const schedule = workingHours.work_schedule.find((s) => s.day.toLowerCase() === dayName);
    if (!schedule) {
      return [];
    }

    const timeSlots = [];
    for (const slot of schedule.slots) {
      const startTime = this.parseTime(slot.start_time);
      const endTime = this.parseTime(slot.end_time);

      const currentTime = startTime;
      while (currentTime < endTime) {
        timeSlots.push(this.formatTime(currentTime));
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
    }

    const bookedAppointments = await this.appointmentService.getBookedAppointments(
      userId,
      clinicId,
      selectedDate
    );
    const bookedTimes = bookedAppointments.map((appt) => appt.time);
    const availableSlots = timeSlots.filter((time) => !bookedTimes.includes(time));
    return availableSlots;
  }

  async getUserAvailability(
    userId: string,
    clinicId: string,
    daysAhead: number,
  ): Promise<{ date: string; availableSlots: string[] }[]> {
    if (daysAhead <= 0) {
      throw new BadRequestException('daysAhead must be greater than 0');
    }

    const slotDuration = 30;
    const workingHours = await this.clinicUserWorkingHourModel.findOne({
      doctor_id: userId,
      clinic_id: clinicId,
    }).exec();

    if (!workingHours) {
      throw new NotFoundException(`Working hours not found for doctor ${userId} in clinic ${clinicId}`);
    }

    const { work_schedule } = workingHours;

    console.log('Work schedule from DB:', JSON.stringify(work_schedule, null, 2));

    if (!work_schedule || work_schedule.length === 0) {
      throw new BadRequestException('The doctor has no defined working schedule in this clinic');
    }

    const today = new Date();
    const availability: { date: string; availableSlots: string[] }[] = [];

    for (let i = 0; i < daysAhead; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Skip past dates
      if (currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        console.log(`Skipping past date: ${currentDate.toISOString().split('T')[0]}`);
        continue;
      }

      console.log(`Processing date: ${currentDate.toISOString().split('T')[0]}`);

      // Get day name in multiple formats to ensure matching
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayOfWeekShort = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();

      console.log(`Looking for day: ${dayOfWeek} or ${dayOfWeekShort}`);
      console.log(`Available days in schedule:`, work_schedule.map(s => s.day.toLowerCase()));

      // Try to find schedule by different day name formats
      const scheduleForDay = work_schedule.find(schedule =>
        schedule.day.toLowerCase() === dayOfWeek ||
        schedule.day.toLowerCase() === dayOfWeekShort
      );

      if (!scheduleForDay) {
        continue;
      }

      const dateString = currentDate.toISOString().split('T')[0];
      const appointmentsOnDate = await this.appointmentService.findByDoctorAndDate(
        userId,
        clinicId,
        dateString
      );

      const bookedSlots = appointmentsOnDate.map(appointment => appointment.time);

      console.log(`Date: ${dateString}, Day: ${dayOfWeek}, Schedule found: ${!!scheduleForDay}`);
      console.log(`Booked slots:`, bookedSlots);
      console.log(`Schedule for day:`, scheduleForDay);

      const availableSlots: string[] = [];

      for (const slot of scheduleForDay.slots) {
        const startTime = slot.start_time;
        const endTime = slot.end_time;

        console.log(`Processing slot: ${startTime} - ${endTime}`);

        let currentTime = startTime;

        while (this.timeToMinutes(currentTime) < this.timeToMinutes(endTime)) {
          console.log(`Generated time slot: ${currentTime}, minutes: ${this.timeToMinutes(currentTime)}`);
          if (!bookedSlots.includes(currentTime)) {
            availableSlots.push(currentTime);
          }
          currentTime = this.addMinutesToTime(currentTime, slotDuration);
        }
      }
      availableSlots.sort((a, b) => {
        const timeA = a.split(':').map(Number);
        const timeB = b.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        return minutesA - minutesB;
      });

      console.log(`Available slots for ${dateString}:`, availableSlots);

      if (availableSlots.length > 0) {
        availability.push({
          date: dateString,
          availableSlots,
        });
      }
    }

    console.log('Final availability result:', availability);
    return availability;
  }

  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hour, minute] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + minutes;

    const newHour = Math.floor(totalMinutes / 60) % 24;
    const newMinute = totalMinutes % 60;

    return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
} 