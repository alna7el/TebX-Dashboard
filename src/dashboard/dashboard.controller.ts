import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { 
  ClinicOverviewDto 
} from './dto/clinic-overview.dto';
import { 
  WaitingRoomDto, 
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

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth('access_token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('clinic/:clinicId/overview')
  @ApiOperation({ 
    summary: 'Get real-time clinic overview',
    description: 'Provides comprehensive dashboard overview including appointment summary, patient flow, and doctor status for today'
  })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Clinic overview retrieved successfully',
    type: ClinicOverviewDto 
  })
  async getClinicOverview(@Param('clinicId') clinicId: string): Promise<ClinicOverviewDto> {
    return this.dashboardService.getClinicOverview(clinicId);
  }

  @Get('clinic/:clinicId/waiting-room')
  @ApiOperation({ 
    summary: 'Get waiting room queue status',
    description: 'Returns current waiting room queue with patient details, positions, and estimated wait times'
  })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Waiting room data retrieved successfully',
    type: WaitingRoomDto 
  })
  async getWaitingRoom(@Param('clinicId') clinicId: string): Promise<WaitingRoomDto> {
    return this.dashboardService.getWaitingRoom(clinicId);
  }

  @Get('clinic/:clinicId/queue-analytics')
  @ApiOperation({ 
    summary: 'Get queue analytics',
    description: 'Provides detailed queue analytics including peak times, hourly data, and performance metrics'
  })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Queue analytics retrieved successfully',
    type: QueueAnalyticsDto 
  })
  async getQueueAnalytics(@Param('clinicId') clinicId: string): Promise<QueueAnalyticsDto> {
    return this.dashboardService.getQueueAnalytics(clinicId);
  }

  @Post('patient/check-in')
  @ApiOperation({ 
    summary: 'Check in patient',
    description: 'Marks patient as arrived and adds them to the waiting queue'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Patient checked in successfully',
    type: QuickActionResponseDto 
  })
  async checkInPatient(@Body() checkInDto: CheckInDto): Promise<QuickActionResponseDto> {
    return this.dashboardService.checkInPatient(checkInDto);
  }

  @Post('emergency-booking')
  @ApiOperation({ 
    summary: 'Create emergency appointment',
    description: 'Creates high-priority emergency appointment with immediate availability'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Emergency appointment created successfully',
    type: QuickActionResponseDto 
  })
  async createEmergencyBooking(@Body() emergencyDto: EmergencyBookingDto): Promise<QuickActionResponseDto> {
    return this.dashboardService.createEmergencyBooking(emergencyDto);
  }

  @Put('bulk-status-update')
  @ApiOperation({ 
    summary: 'Bulk update appointment status',
    description: 'Updates status for multiple appointments simultaneously'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bulk status update completed',
    type: QuickActionResponseDto 
  })
  async bulkUpdateStatus(@Body() bulkUpdateDto: BulkStatusUpdateDto): Promise<QuickActionResponseDto> {
    return this.dashboardService.bulkUpdateStatus(bulkUpdateDto);
  }

  @Post('patient/quick-lookup')
  @ApiOperation({ 
    summary: 'Quick patient search',
    description: 'Fast patient lookup by name, phone, or medical file number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Patient search results',
    type: [QuickPatientResultDto] 
  })
  async quickPatientLookup(@Body() lookupDto: QuickPatientLookupDto): Promise<QuickPatientResultDto[]> {
    return this.dashboardService.quickPatientLookup(lookupDto);
  }

  @Post('one-click-operation')
  @ApiOperation({ 
    summary: 'Perform one-click operation',
    description: 'Execute common receptionist operations (reschedule, cancel, mark present, mark no-show)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Operation completed successfully',
    type: QuickActionResponseDto 
  })
  async performOneClickOperation(@Body() operationDto: OneClickOperationDto): Promise<QuickActionResponseDto> {
    return this.dashboardService.performOneClickOperation(operationDto);
  }
}
