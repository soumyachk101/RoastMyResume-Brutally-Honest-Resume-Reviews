export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number,
        public isOperational: boolean = true,
        public metadata?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Authentication Errors
export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 'UNAUTHORIZED', 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 'FORBIDDEN', 403);
    }
}

// Validation Errors
export class ValidationError extends AppError {
    constructor(message: string, metadata?: Record<string, any>) {
        super(message, 'VALIDATION_ERROR', 400, true, metadata);
    }
}

// Resume Errors
export class ResumeParseError extends AppError {
    constructor(message = 'Failed to parse resume') {
        super(message, 'PARSE_FAILURE', 422);
    }
}

export class InsufficientContentError extends AppError {
    constructor() {
        super(
            'Resume has insufficient content. Please upload a complete resume.',
            'INSUFFICIENT_CONTENT',
            422
        );
    }
}

export class FileTooLargeError extends AppError {
    constructor(maxSizeMb: number = 5) {
        super(
            `File exceeds maximum size of ${maxSizeMb}MB`,
            'FILE_TOO_LARGE',
            413
        );
    }
}

export class UnsupportedFileTypeError extends AppError {
    constructor(fileType: string) {
        super(
            `Unsupported file type: ${fileType}. Please upload PDF, DOCX, or TXT.`,
            'UNSUPPORTED_FILE_TYPE',
            400
        );
    }
}

// Rate Limiting Errors
export class QuotaExceededError extends AppError {
    constructor(retryAfter?: number) {
        super(
            'Daily roast limit reached. Upgrade to Pro for unlimited roasts!',
            'QUOTA_EXCEEDED',
            429,
            true,
            { retryAfter }
        );
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter: number) {
        super(
            'Too many requests. Please try again later.',
            'RATE_LIMITED',
            429,
            true,
            { retryAfter }
        );
    }
}

// AI Errors
export class AIProviderError extends AppError {
    constructor(provider: string, originalError?: Error) {
        super(
            `AI provider ${provider} failed`,
            'AI_PROVIDER_ERROR',
            502,
            true,
            { provider, originalError: originalError?.message }
        );
    }
}

export class AllProvidersFailedError extends AppError {
    constructor() {
        super(
            'All AI providers are currently unavailable. Please try again in a few minutes.',
            'ALL_PROVIDERS_FAILED',
            503
        );
    }
}
