# Vitafit Body Composition

Web App to export data from Vitafit Scale and upload it to Garmin Connect Cloud. Project forked from https://github.com/lswiderski/WebBodyComposition/ and tailored to Vitafit features.

Application URL: https://vitafit-body-composition.vercel.app/

## Instruction

- Stand on your scale. Measure yourself. Complete the user form data, address and get data from the scale.

- Then you can review your data and upload it to Garmin Cloud.

- The unofficial Garmin API does not support 2FA. To use this application, you must disable it.

- This App pass your data, email and password to Garmin Connect Cloud via proxy API server and then it sends to Garmin Cloud.

- The Proxy API does not store or log anything, it's just a middleware between this App and Garmin services.

- Proxy API repository: https://github.com/lswiderski/bodycomposition-webapi


## Screenshots

![Web Application index](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/1_index.png)
![Scanner](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/2_xiaomi_scanner.png)
![Scale request](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/3_request.png)
![Scanning](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/4_scanning.png)
![Result](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/5_result.png)
![Garmin Form](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/6_garmin_form.png)
![FAQ](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/7_faq.png)
![Garmin Connect](https://github.com/lswiderski/WebBodyComposition/blob/main/resources/img/screenshots/8_garmin_result.png)