@echo off
echo ---------------------------------------------------
echo KHOI DONG MOI TRUONG BLOCKCHAIN LOCAL DE DEMO
echo ---------------------------------------------------

echo [1/2] Dang mo Hardhat Node trong cua so moi...
:: Mở cửa sổ cmd mới chạy npx hardhat node và giữ nó mở
start "Hardhat Local Node" cmd /k "npx hardhat node"

echo Dang doi 10 giay de node khoi dong...
:: Đợi 10 giây để đảm bảo node đã chạy xong trước khi deploy
timeout /t 10 /nobreak >nul

echo [2/2] Dang chay Script Deploy...
:: Chạy script deploy và seed dữ liệu
call npx hardhat run scripts/seed.ts --network localhost

echo.
echo ---------------------------------------------------
echo  THANH CONG!
echo  - Local Node dang chay o cua so ben canh.
echo  - Contract da duoc deploy.
echo  - San sang ket noi Frontend.
echo ---------------------------------------------------
pause
