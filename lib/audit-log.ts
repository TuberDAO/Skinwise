/**
 * Audit Logging System for SkinWise
 * Tracks security events, user actions, and potential threats
 */

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  
  // File upload events
  FILE_UPLOAD_SUCCESS = 'FILE_UPLOAD_SUCCESS',
  FILE_UPLOAD_FAILURE = 'FILE_UPLOAD_FAILURE',
  FILE_VALIDATION_FAILURE = 'FILE_VALIDATION_FAILURE',
  
  // Payment events
  PAYMENT_ATTEMPT = 'PAYMENT_ATTEMPT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILURE = 'PAYMENT_FAILURE',
  PAYMENT_FRAUD_SUSPECTED = 'PAYMENT_FRAUD_SUSPECTED',
  
  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  
  // API events
  API_REQUEST = 'API_REQUEST',
  API_ERROR = 'API_ERROR',
  
  // Data events
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  DATA_DELETION = 'DATA_DELETION',
  
  // Email events
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_FAILED = 'EMAIL_FAILED',
  EMAIL_SPAM_SUSPECTED = 'EMAIL_SPAM_SUSPECTED'
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  eventType: AuditEventType
  severity: AuditSeverity
  userId?: string
  sessionId?: string
  ipAddress: string
  userAgent: string
  resource?: string
  action?: string
  details: Record<string, any>
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

class AuditLogger {
  private static instance: AuditLogger
  private logs: AuditLogEntry[] = []
  private maxLogSize = 1000 // Keep last 1000 entries in memory

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  /**
   * Log an audit event
   */
  log(
    eventType: AuditEventType,
    severity: AuditSeverity,
    details: Record<string, any>,
    context: {
      userId?: string
      sessionId?: string
      ipAddress: string
      userAgent: string
      resource?: string
      action?: string
      success: boolean
      errorMessage?: string
    }
  ): void {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType,
      severity,
      ...context,
      details: this.sanitizeDetails(details),
      metadata: {
        nodeEnv: process.env.NODE_ENV,
        timestamp_ms: Date.now()
      }
    }

    // Add to in-memory log
    this.logs.push(entry)
    
    // Keep memory usage reasonable
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize)
    }

    // Console logging with appropriate level
    this.consoleLog(entry)

    // In production, send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(entry)
    }

    // Store critical events in database
    if (severity === AuditSeverity.CRITICAL || severity === AuditSeverity.HIGH) {
      this.storeCriticalEvent(entry)
    }
  }

  /**
   * Log authentication events
   */
  logAuth(
    success: boolean,
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    method: 'google' | 'email' = 'google',
    errorMessage?: string
  ): void {
    this.log(
      success ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILURE,
      success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      { method, provider: 'firebase' },
      {
        userId,
        ipAddress,
        userAgent,
        resource: '/api/auth',
        action: 'authenticate',
        success,
        errorMessage
      }
    )
  }

  /**
   * Log file upload events
   */
  logFileUpload(
    success: boolean,
    userId: string,
    files: { name: string; size: number; type: string }[],
    ipAddress: string,
    userAgent: string,
    errorMessage?: string
  ): void {
    this.log(
      success ? AuditEventType.FILE_UPLOAD_SUCCESS : AuditEventType.FILE_UPLOAD_FAILURE,
      success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      {
        fileCount: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        fileTypes: [...new Set(files.map(f => f.type))],
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      },
      {
        userId,
        ipAddress,
        userAgent,
        resource: '/api/upload',
        action: 'file_upload',
        success,
        errorMessage
      }
    )
  }

  /**
   * Log payment events
   */
  logPayment(
    success: boolean,
    userId: string,
    amount: number,
    currency: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    errorMessage?: string,
    fraudSuspected: boolean = false
  ): void {
    const eventType = fraudSuspected 
      ? AuditEventType.PAYMENT_FRAUD_SUSPECTED
      : success 
        ? AuditEventType.PAYMENT_SUCCESS 
        : AuditEventType.PAYMENT_FAILURE

    const severity = fraudSuspected 
      ? AuditSeverity.CRITICAL
      : success 
        ? AuditSeverity.LOW 
        : AuditSeverity.MEDIUM

    this.log(
      eventType,
      severity,
      {
        amount,
        currency,
        stripeSessionId: sessionId,
        fraudSuspected
      },
      {
        userId,
        sessionId,
        ipAddress,
        userAgent,
        resource: '/api/create-checkout-session',
        action: 'payment',
        success,
        errorMessage
      }
    )
  }

  /**
   * Log rate limit violations
   */
  logRateLimit(
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    endpoint: string,
    limitType: string
  ): void {
    this.log(
      AuditEventType.RATE_LIMIT_EXCEEDED,
      AuditSeverity.HIGH,
      {
        limitType,
        endpoint
      },
      {
        userId,
        ipAddress,
        userAgent,
        resource: endpoint,
        action: 'rate_limit_violation',
        success: false,
        errorMessage: 'Rate limit exceeded'
      }
    )
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(
    description: string,
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    details: Record<string, any>
  ): void {
    this.log(
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditSeverity.HIGH,
      { description, ...details },
      {
        userId,
        ipAddress,
        userAgent,
        action: 'suspicious_activity',
        success: false
      }
    )
  }

  /**
   * Log API requests (for high-security endpoints)
   */
  logApiRequest(
    endpoint: string,
    method: string,
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    responseStatus: number,
    responseTime: number
  ): void {
    this.log(
      AuditEventType.API_REQUEST,
      AuditSeverity.LOW,
      {
        endpoint,
        method,
        responseStatus,
        responseTime
      },
      {
        userId,
        ipAddress,
        userAgent,
        resource: endpoint,
        action: method.toLowerCase(),
        success: responseStatus < 400
      }
    )
  }

  /**
   * Get recent logs (for admin dashboard)
   */
  getRecentLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(-limit).reverse()
  }

  /**
   * Get logs by event type
   */
  getLogsByType(eventType: AuditEventType, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.eventType === eventType)
      .slice(-limit)
      .reverse()
  }

  /**
   * Get logs by user
   */
  getLogsByUser(userId: string, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit)
      .reverse()
  }

  /**
   * Get security alerts (high/critical severity)
   */
  getSecurityAlerts(limit: number = 20): AuditLogEntry[] {
    return this.logs
      .filter(log => log.severity === AuditSeverity.HIGH || log.severity === AuditSeverity.CRITICAL)
      .slice(-limit)
      .reverse()
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details }
    
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'creditCard']
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]'
      }
    }

    // Truncate long strings
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...[TRUNCATED]'
      }
    }

    return sanitized
  }

  private consoleLog(entry: AuditLogEntry): void {
    const emoji = this.getSeverityEmoji(entry.severity)
    const message = `${emoji} [${entry.eventType}] ${entry.success ? '✅' : '❌'}`
    
    switch (entry.severity) {
      case AuditSeverity.CRITICAL:
        console.error(message, entry)
        break
      case AuditSeverity.HIGH:
        console.warn(message, entry)
        break
      case AuditSeverity.MEDIUM:
        console.info(message, entry)
        break
      default:
        console.log(message, entry)
    }
  }

  private getSeverityEmoji(severity: AuditSeverity): string {
    switch (severity) {
      case AuditSeverity.CRITICAL: return '🚨'
      case AuditSeverity.HIGH: return '⚠️'
      case AuditSeverity.MEDIUM: return 'ℹ️'
      default: return '📝'
    }
  }

  private async sendToMonitoringService(entry: AuditLogEntry): Promise<void> {
    try {
      // In production, integrate with services like:
      // - Sentry for error tracking
      // - DataDog for monitoring
      // - LogRocket for user sessions
      // - CloudWatch for AWS deployments
      
      // Example integration:
      // await fetch('/api/monitoring/audit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })
      
      console.log('📊 Would send to monitoring service:', entry.id)
    } catch (error) {
      console.error('Failed to send audit log to monitoring service:', error)
    }
  }

  private async storeCriticalEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // Store critical events in database for long-term retention
      // This could be Firestore, PostgreSQL, or a specialized audit database
      
      console.log('💾 Would store critical event in database:', entry.id)
      
      // Example Firestore storage:
      // const { firestore } = await import('@/firebase')
      // if (firestore) {
      //   await addDoc(collection(firestore, 'audit_logs'), entry)
      // }
    } catch (error) {
      console.error('Failed to store critical audit event:', error)
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Convenience functions
export const logAuth = auditLogger.logAuth.bind(auditLogger)
export const logFileUpload = auditLogger.logFileUpload.bind(auditLogger)
export const logPayment = auditLogger.logPayment.bind(auditLogger)
export const logRateLimit = auditLogger.logRateLimit.bind(auditLogger)
export const logSuspiciousActivity = auditLogger.logSuspiciousActivity.bind(auditLogger)
export const logApiRequest = auditLogger.logApiRequest.bind(auditLogger) 