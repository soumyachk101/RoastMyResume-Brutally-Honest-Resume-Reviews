import { describe, it, expect } from 'vitest';
import {
    AppError,
    UnauthorizedError,
    ValidationError,
    FileTooLargeError,
    QuotaExceededError
} from '../errors';

describe('Shared Custom Errors', () => {
    it('AppError should set base properties correctly', () => {
        const error = new AppError('Test error', 'TEST_CODE', 500, false, { detail: 'info' });

        expect(error.message).toBe('Test error');
        expect(error.code).toBe('TEST_CODE');
        expect(error.statusCode).toBe(500);
        expect(error.isOperational).toBe(false);
        expect(error.metadata).toEqual({ detail: 'info' });
        expect(error.name).toBe('AppError');
        expect(error.stack).toBeDefined();
    });

    it('UnauthorizedError should default to 401 UNAUTHORIZED', () => {
        const error = new UnauthorizedError();
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('UNAUTHORIZED');
        expect(error.message).toBe('Authentication required');
        expect(error.isOperational).toBe(true);
    });

    it('ValidationError should default to 400 VALIDATION_ERROR and store metadata', () => {
        const metadata = { field: 'email', issue: 'invalid format' };
        const error = new ValidationError('Invalid input', metadata);

        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.metadata).toEqual(metadata);
    });

    it('FileTooLargeError should format the dynamic message based on MB', () => {
        const error = new FileTooLargeError(10);
        expect(error.message).toBe('File exceeds maximum size of 10MB');
        expect(error.statusCode).toBe(413);

        const defaultError = new FileTooLargeError();
        expect(defaultError.message).toBe('File exceeds maximum size of 5MB');
    });

    it('QuotaExceededError should include retryAfter metadata', () => {
        const error = new QuotaExceededError(3600);
        expect(error.statusCode).toBe(429);
        expect(error.metadata?.retryAfter).toBe(3600);
    });
});
