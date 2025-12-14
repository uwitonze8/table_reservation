@echo off
rem Maven wrapper script for Windows

setlocal

set MAVEN_HOME=%~dp0\.mvn\wrapper\maven-wrapper.jar
set MAVEN_OPTS=-Xmx1024m

java %MAVEN_OPTS% -jar "%MAVEN_HOME%" %*

endlocal