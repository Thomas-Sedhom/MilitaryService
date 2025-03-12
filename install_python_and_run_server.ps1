# Define Python installer URL
$pythonInstallerUrl = "https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe"

# Check if Python is installed
$pythonInstalled = $false
try {
    python --version
    $pythonInstalled = $true
} catch {
    $pythonInstalled = $false
}

if (-not $pythonInstalled) {
    Write-Host "Python is not installed. Downloading..."
    
    # Define download path
    $installerPath = "$env:TEMP\python_installer.exe"

    # Download Python installer
    Invoke-WebRequest -Uri $pythonInstallerUrl -OutFile $installerPath
    Write-Host "Python downloaded successfully."

    # Install Python silently
    Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
    Write-Host "Python installed successfully."
}

# Verify Python installation
try {
    python --version
    Write-Host "Python is installed successfully!"
} catch {
    Write-Host "Python installation failed. Please install manually."
    exit 1
}

# Navigate to the project directory (Modify path if needed)
$projectPath = "D:\work\MilitaryService-main\MilitaryService-main"
Set-Location -Path $projectPath

# Start a local HTTP server on port 5500
Write-Host "Starting Python HTTP server at http://localhost:5500..."
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m http.server 5500"
