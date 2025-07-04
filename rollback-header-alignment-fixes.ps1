# Rollback Script for Header Alignment & Responsive Preview Fixes
# Created: [DATE]
# Fixes to rollback:
# 1. Header SkinWise title alignment (absolute centering)
# 2. Responsive preview toolbar z-index fixes

Write-Host "🔄 Rolling back header alignment and responsive preview fixes..." -ForegroundColor Yellow
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not available. Please install Git to proceed." -ForegroundColor Red
    exit 1
}

# Backup current state
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Write-Host "📁 Creating backup of current state..." -ForegroundColor Blue
Copy-Item "app/page.tsx" -Destination "app/page.tsx.backup-header-alignment-rollback-$timestamp" -Force
Write-Host "✅ Backup created: app/page.tsx.backup-header-alignment-rollback-$timestamp"

# Rollback app/page.tsx header changes
Write-Host "🔧 Rolling back header alignment changes..." -ForegroundColor Blue

# Read current file
$content = Get-Content "app/page.tsx" -Raw

# Revert header changes
$content = $content -replace 'hidden md:flex absolute left-1/2 transform -translate-x-1/2', 'hidden md:flex flex-1 items-center justify-center'
$content = $content -replace 'hidden md:flex gap-4 lg:gap-6 ml-auto', 'hidden md:flex gap-4 lg:gap-6'
$content = $content -replace 'md:hidden p-2 ml-auto', 'md:hidden p-2'
$content = $content -replace 'md:hidden z-40', 'md:hidden z-50'

# Write back to file
$content | Out-File "app/page.tsx" -Encoding utf8 -NoNewline

Write-Host "✅ Header alignment changes rolled back"

# Test build
Write-Host "🏗️ Testing build after rollback..." -ForegroundColor Blue
$buildResult = & npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful after rollback" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed after rollback!" -ForegroundColor Red
    Write-Host "Build output:" -ForegroundColor Yellow
    Write-Host $buildResult
    
    # Restore from backup
    Write-Host "🔄 Restoring from backup..." -ForegroundColor Blue
    Copy-Item "app/page.tsx.backup-header-alignment-rollback-$timestamp" -Destination "app/page.tsx" -Force
    Write-Host "✅ Restored from backup"
    exit 1
}

# Commit rollback
Write-Host "📝 Committing rollback..." -ForegroundColor Blue
& git add app/page.tsx
& git commit -m "Rollback: Header alignment and responsive preview fixes

- Reverted SkinWise title from absolute centering to flex centering
- Reverted navigation positioning changes
- Reverted z-index changes for mobile menu
- Responsive preview may be less visible but build working

Rollback reason: [Add reason here]"

Write-Host ""
Write-Host "✅ Rollback completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was rolled back:" -ForegroundColor Cyan
Write-Host "• SkinWise title alignment (back to flex centering)"
Write-Host "• Desktop navigation positioning (back to default)"
Write-Host "• Mobile menu button positioning (back to default)"
Write-Host "• Mobile menu z-index (back to z-50)"
Write-Host ""
Write-Host "⚠️  Note: Responsive preview toolbar visibility may be reduced" -ForegroundColor Yellow
Write-Host "🔄 To re-apply fixes: Check git history or re-implement from documentation"
Write-Host ""
Write-Host "📁 Backup file: app/page.tsx.backup-header-alignment-rollback-$timestamp" 