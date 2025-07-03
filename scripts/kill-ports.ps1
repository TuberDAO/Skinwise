# Kill processes holding common development ports
# Run this script if you encounter port conflicts

Write-Host "Checking for processes holding development ports..." -ForegroundColor Yellow

# Check and kill processes on ports 3000-3005
for ($port = 3000; $port -le 3005; $port++) {
    $connections = netstat -ano | Select-String ":$port\s"
    
    if ($connections) {
        Write-Host "Found processes on port $port" -ForegroundColor Red
        
        # Extract PIDs and kill them
        foreach ($connection in $connections) {
            if ($connection -match '\s+(\d+)\s*$') {
                $processId = $matches[1]
                try {
                    $processInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($processInfo) {
                        Write-Host "Killing $($processInfo.ProcessName) (PID: $processId) on port $port" -ForegroundColor Red
                        Stop-Process -Id $processId -Force
                        Write-Host "✅ Killed process $processId" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "❌ Could not kill process $processId" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "✅ Port $port is free" -ForegroundColor Green
    }
}

Write-Host "`nDone! You can now run 'npm run dev' safely." -ForegroundColor Yellow 