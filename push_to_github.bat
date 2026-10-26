@echo off
set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/shravanmali/ResQ.git): "
if "%REPO_URL%"=="" goto error

echo Adding remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESSFULLY PUSHED TO GITHUB!
    echo  Now go to https://vercel.com/new and import this repo.
    echo ========================================================
) else (
    echo.
    echo Failed to push. Please check your repository URL and permissions.
)
goto end

:error
echo Error: Repository URL cannot be empty!

:end
pause
