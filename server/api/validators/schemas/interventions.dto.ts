
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsNumber, IsEnum, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum InterventionStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum InterventionPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export class CreateInterventionDto {
    @IsUUID()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(InterventionPriority)
    @IsOptional()
    priority?: InterventionPriority;

    @IsUUID()
    @IsOptional()
    ownerId?: string;

    @IsObject()
    @IsOptional()
    rationale?: any;

    @IsObject()
    @IsOptional()
    actionPlan?: any;

    @IsObject()
    @IsOptional()
    expectedOutcome?: any;

    @IsDateString()
    @IsOptional()
    dueDate?: string;
}

export class UpdateInterventionDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(InterventionStatus)
    @IsOptional()
    status?: InterventionStatus;

    @IsEnum(InterventionPriority)
    @IsOptional()
    priority?: InterventionPriority;

    @IsUUID()
    @IsOptional()
    ownerId?: string;

    @IsObject()
    @IsOptional()
    actionPlan?: any;

    @IsObject()
    @IsOptional()
    actualOutcome?: any;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsDateString()
    @IsOptional()
    startedAt?: string;

    @IsDateString()
    @IsOptional()
    completedAt?: string;
}

export class AssignInterventionDto {
    @IsUUID()
    @IsNotEmpty()
    ownerId: string;
}

export class CloseInterventionDto {
    @IsObject()
    @IsNotEmpty()
    actualOutcome: any;
}

export class ListInterventionsQueryDto {
    @IsOptional()
    @IsUUID()
    employeeId?: string;

    @IsOptional()
    @IsEnum(InterventionStatus)
    status?: InterventionStatus;

    @IsOptional()
    @IsEnum(InterventionPriority)
    priority?: InterventionPriority;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsUUID()
    ownerId?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    pageSize?: number = 10;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}
