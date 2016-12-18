# Qlink.it Chrome Extension Client

This code is a client application of Qlink.it Web Application for Chrome browser.
For compile this client you need:

1. Deploy the [Qlink.it Web Application](https://github.com/qlinkit/webapp).
2. Modify the value of the **webServer** variable of the files

  - **qlink/application.js**
  - **qlink/contextual.js**

  by that matches your web server.

3. Modify the **qlink/manifest.json** file with the settings corresponding to the extension you want to publish.
4. Generate the private key necessary to publish the extension in your google account.
5. Download the .pem private key generated in step 4 to the main project folder. Then run the bash pack.sh script to generate the ready-to-distribute CRX package.

```bash
./pack.sh qlink private.pem
```
____
If you wish, you can perform fork of this project and contribute with the improvements that you consider necessary. It will be greatly appreciated.

# About
Qlink.it application is distributed under [MIT license](https://opensource.org/licenses/MIT). You can read more about this project at [https://qlink.it/main](https://qlink.it/main).
