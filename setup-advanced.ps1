#!/usr/bin/env pwsh

# Advanced setup script with progress bar and better error handling

function WriteStep {
    param([string]$Message, [int]$Step, [int]$Total)
    $Percentage = [math]::Round(($Step / $Total) * 100)
    Write-Progress -Activity "Quantum Vector Artifacts Setup" -Status $Message -PercentComplete $Percentage
    Write-Host "[$Step/$Total] $Message" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Compatibility and diagnostics
$PSMajor = $PSVersionTable.PSVersion.Major
if ($PSMajor -lt 6) {
    Write-Host "WARNING: Detected Windows PowerShell ($($PSVersionTable.PSVersion)) — PowerShell 7+ (pwsh) is recommended for best compatibility." -ForegroundColor Yellow
}

function Invoke-External {
    param(
        [string]$Exe,
        [string[]]$Args
    )
    $cmdLine = "$Exe $($Args -join ' ')".Trim()
    Write-Host "-> $cmdLine" -ForegroundColor DarkGray

    # Execute directly so this works across PowerShell editions
    & $Exe @Args
    $exit = $LASTEXITCODE
    if ($exit -ne 0) {
        throw "Command failed: $cmdLine (Exit code: $exit)"
    }
}

Write-Host @"
Quantum Vector Artifacts Setup
=============================
PowerShell automated installer
"@ -ForegroundColor Magenta

# Prerequisites check
WriteStep -Message "Checking prerequisites..." -Step 1 -Total 6

if (-not (Test-Command "npm")) {
    Write-Host "ERROR: npm not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Command "git")) {
    Write-Host "NOTE: git not found. Git is recommended for version control." -ForegroundColor Yellow
}

$nodeVersion = (& node --version) -join " `n"
$npmVersion = (& npm --version) -join " `n"
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "npm: $npmVersion" -ForegroundColor Green

try {
    # Step 1: Create Vite project
    WriteStep -Message "Creating Vite React project..." -Step 2 -Total 6

    # Use direct invocation for cross-version compatibility
    Invoke-External -Exe "npm" -Args @("create", "vite@latest", ".", "--", "--template", "react")

    # Step 2: Install dependencies
    WriteStep -Message "Installing base dependencies..." -Step 3 -Total 6
    Invoke-External -Exe "npm" -Args @("install")

    # Step 3: Install Three.js
    WriteStep -Message "Installing Three.js and types..." -Step 4 -Total 6
    Invoke-External -Exe "npm" -Args @("install", "three", "@types/three")

    # Step 4: Install Tailwind CSS
    WriteStep -Message "Installing Tailwind CSS..." -Step 5 -Total 6
    Invoke-External -Exe "npm" -Args @("install", "-D", "tailwindcss", "postcss", "autoprefixer")

    # Step 5: Initialize Tailwind
    WriteStep -Message "Initializing Tailwind configuration..." -Step 6 -Total 6
    Invoke-External -Exe "npx" -Args @("tailwindcss", "init", "-p")

    Write-Progress -Activity "Quantum Vector Artifacts Setup" -Completed

    # Success
    Write-Host @"

SETUP COMPLETE

Next steps:
   1. npm run dev     # Start development server
   2. Open http://localhost:5173
   3. Begin coding your quantum artifacts!

Project structure created:
   - React + Vite configured
   - Three.js installed for 3D graphics
   - Tailwind CSS ready for styling
   - TypeScript types included

Happy quantum coding!
"@ -ForegroundColor Green

} catch {
    Write-Progress -Activity "Setup" -Completed
    Write-Host "ERROR: Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running the commands manually:" -ForegroundColor Yellow
    Write-Host "   npm create vite@latest . -- --template react" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor White
    Write-Host "   npm install three @types/three" -ForegroundColor White
    Write-Host "   npm install -D tailwindcss postcss autoprefixer" -ForegroundColor White
    Write-Host "   npx tailwindcss init -p" -ForegroundColor White
    exit 1
}