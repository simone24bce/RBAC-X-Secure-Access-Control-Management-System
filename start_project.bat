@echo off
start cmd /k "mongod"
start cmd /k "npm run dev"
start cmd /k "cd frontend && npx vite --force"
pause