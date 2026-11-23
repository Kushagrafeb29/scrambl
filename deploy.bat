@echo off
echo ==================================================================
echo SCRAMBL - FIREBASE DEPLOYMENT AUTOMATION
echo ==================================================================
echo.
echo I am now deploying the site to Firebase for you.
echo.
echo NOTE: If you haven't authorized this terminal before, 
echo a Google Login page will pop up in your browser. 
echo Please select your Google account and click "Allow", 
echo then this window will continue deploying automatically!
echo.
echo Starting login and deployment...
call npx --yes firebase-tools@12.9.1 login
call npx --yes firebase-tools@12.9.1 deploy --only hosting
echo.
echo ==================================================================
echo Deployment process has finished! You can close this window now.
echo ==================================================================
pause
