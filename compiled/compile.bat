@echo off

cd "%~dp0"

@echo Merging  sources
@IF EXIST DGTable.src.js del DGTable.src.js
copy "..\src\DGTable.js" ^
     /A + "..\src\DGTable.ColumnCollection.js" ^
     /A + "..\src\DGTable.RowCollection.js" ^
     "DGTable.src.js" /B

@echo Compiling...
@"C:\Program Files (x86)\Java\jre7\bin\java" -jar ^
     "%~dp0\compiler.jar" ^
     --externs ^
		externs\jquery-1.9.externs ^
		externs\underscore-1.5.2.externs ^
		externs\backbone-1.1.0.externs ^
     --charset UTF8 ^
     --compilation_level ADVANCED_OPTIMIZATIONS ^
     --js DGTable.src.js ^
     --js_output_file DGTable.min.js
@IF EXIST DGTable.src.js del DGTable.src.js

@echo Done!
@echo Press any key to exit...
pause