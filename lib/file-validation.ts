/**
 * File Upload Security and Validation
 * Comprehensive file validation system to prevent malicious uploads
 */

// Allowed file types and their signatures
const ALLOWED_FILE_TYPES = {
  'image/jpeg': {
    extensions: ['.jpg', '.jpeg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    signatures: [
      [0xFF, 0xD8, 0xFF], // JPEG
    ]
  },
  'image/png': {
    extensions: ['.png'],
    maxSize: 10 * 1024 * 1024, // 10MB
    signatures: [
      [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
    ]
  },
  'image/webp': {
    extensions: ['.webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    signatures: [
      [0x52, 0x49, 0x46, 0x46], // RIFF (WebP container)
    ]
  }
} as const

// Security limits
const MAX_FILES_PER_UPLOAD = 4
const MAX_TOTAL_SIZE = 40 * 1024 * 1024 // 40MB total
const MIN_FILE_SIZE = 1024 // 1KB minimum

// Dangerous file extensions (never allow these)
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.sh', '.py', '.rb', '.pl', '.dll',
  '.sys', '.ini', '.reg', '.msi', '.app', '.deb', '.rpm', '.dmg'
]

export interface FileValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
  sanitizedName?: string
}

export interface FileSecurityInfo {
  originalName: string
  sanitizedName: string
  size: number
  type: string
  lastModified: number
  securityChecks: {
    extensionCheck: boolean
    signatureCheck: boolean
    sizeCheck: boolean
    nameCheck: boolean
    dangerousContentCheck: boolean
  }
}

/**
 * Check file signature (magic numbers) to verify actual file type
 */
function checkFileSignature(buffer: ArrayBuffer, mimeType: string): boolean {
  const fileTypeInfo = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]
  if (!fileTypeInfo) return false

  const uint8Array = new Uint8Array(buffer.slice(0, 16)) // First 16 bytes

  return fileTypeInfo.signatures.some(signature => {
    return signature.every((byte, index) => uint8Array[index] === byte)
  })
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
  
  // Remove consecutive dots to prevent path traversal
  sanitized = sanitized.replace(/\.{2,}/g, '_')
  
  // Ensure filename doesn't start with dot or dash
  sanitized = sanitized.replace(/^[.-]/, '_')
  
  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    sanitized = sanitized.substring(0, 97 - ext.length) + ext
  }
  
  // Ensure it's not empty
  if (!sanitized || sanitized.trim().length === 0) {
    sanitized = `file_${Date.now()}`
  }
  
  return sanitized
}

/**
 * Check for dangerous file extensions
 */
function checkDangerousExtension(filename: string): boolean {
  const lowerFilename = filename.toLowerCase()
  return DANGEROUS_EXTENSIONS.some(ext => lowerFilename.endsWith(ext))
}

/**
 * Validate a single file
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  const warnings: string[] = []
  
  try {
    // Check file size
    if (file.size < MIN_FILE_SIZE) {
      return { valid: false, error: 'File is too small (minimum 1KB)' }
    }
    
    if (file.size > (ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]?.maxSize || 0)) {
      return { valid: false, error: 'File is too large (maximum 10MB per file)' }
    }

    // Check if file type is allowed
    if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
      return { 
        valid: false, 
        error: `File type not allowed. Supported types: JPEG, PNG, WebP` 
      }
    }

    // Check for dangerous extensions
    if (checkDangerousExtension(file.name)) {
      return { 
        valid: false, 
        error: 'File extension not allowed for security reasons' 
      }
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name)
    if (sanitizedName !== file.name) {
      warnings.push('Filename was modified for security reasons')
    }

    // Read file signature for verification
    const buffer = await file.slice(0, 16).arrayBuffer()
    const signatureValid = checkFileSignature(buffer, file.type)
    
    if (!signatureValid) {
      return { 
        valid: false, 
        error: 'File content does not match declared file type' 
      }
    }

    // Additional security checks for images
    if (file.type.startsWith('image/')) {
      // Check for suspicious patterns in filename
      const suspiciousPatterns = [
        /\.php\./i, /\.asp\./i, /\.jsp\./i, /\.js\./i,
        /script/i, /eval\(/i, /javascript:/i
      ]
      
      if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
        warnings.push('Filename contains potentially suspicious content')
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      sanitizedName
    }

  } catch (error) {
    console.error('File validation error:', error)
    return { 
      valid: false, 
      error: 'File validation failed due to technical error' 
    }
  }
}

/**
 * Validate multiple files
 */
export async function validateFiles(files: File[]): Promise<{
  valid: boolean
  results: FileValidationResult[]
  totalSize: number
  error?: string
}> {
  if (files.length === 0) {
    return {
      valid: false,
      results: [],
      totalSize: 0,
      error: 'No files provided'
    }
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return {
      valid: false,
      results: [],
      totalSize: 0,
      error: `Maximum ${MAX_FILES_PER_UPLOAD} files allowed`
    }
  }

  // Calculate total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    return {
      valid: false,
      results: [],
      totalSize,
      error: `Total file size exceeds 40MB limit`
    }
  }

  // Validate each file
  const results = await Promise.all(files.map(validateFile))
  
  // Check if all files are valid
  const allValid = results.every(result => result.valid)

  return {
    valid: allValid,
    results,
    totalSize,
    error: allValid ? undefined : 'One or more files failed validation'
  }
}

/**
 * Generate security info for audit logging
 */
export function generateFileSecurityInfo(file: File, sanitizedName: string): FileSecurityInfo {
  return {
    originalName: file.name,
    sanitizedName,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    securityChecks: {
      extensionCheck: !checkDangerousExtension(file.name),
      signatureCheck: true, // This would be set by validateFile
      sizeCheck: file.size >= MIN_FILE_SIZE && file.size <= 10 * 1024 * 1024,
      nameCheck: sanitizedName === file.name,
      dangerousContentCheck: true // This would be enhanced with actual content scanning
    }
  }
}

/**
 * Create a secure upload path
 */
export function createSecureUploadPath(userId: string, filename: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const sanitizedName = sanitizeFilename(filename)
  
  return `assessments/${userId}/${timestamp}_${randomSuffix}_${sanitizedName}`
}

/**
 * Security logging for file uploads
 */
export function logFileUploadAttempt(
  userId: string,
  files: File[],
  validationResults: FileValidationResult[],
  success: boolean,
  ip?: string
): void {
  const timestamp = new Date().toISOString()
  
  console.log(`📁 FILE UPLOAD ATTEMPT [${timestamp}]`, {
    userId,
    fileCount: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    success,
    ip: ip || 'unknown',
    files: files.map((file, index) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      valid: validationResults[index]?.valid || false,
      error: validationResults[index]?.error
    }))
  })
  
  // In production, send to monitoring service
  if (!success) {
    console.warn('🚨 FILE UPLOAD SECURITY ALERT', {
      userId,
      ip,
      failedFiles: validationResults.filter(r => !r.valid),
      timestamp
    })
  }
} 