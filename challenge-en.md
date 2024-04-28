# Challenge

**This was translated from spanish using chatGPT** you can find the original in the `challenge-es`.md

**Full-Stack Development Home Test**

The purpose of this test is to evaluate your skills in Backend and Frontend development. You must build a web application that allows users to upload a CSV file with pre-formatted data and display that data as cards on the website, with the ability to filter the data.

**Instructions**

- **You have 48 hours to complete the test.** DO NOT upload any code after submitting it in this system.
- **Your solution MUST include automated tests** for both the frontend and backend. Having good coverage and testing all functions is part of the test.
- You must submit your solution as a **PRIVATE repository on GitHub** and invite xxxxxxx@xxxxxx.com as a collaborator. You can also try with the username xxx-tests.
- **DO NOT create 2 repositories**, make sure to include all the code in the same GitHub repository. Create a "frontend" and "backend" folder within your repository and code directly within them.
- The Frontend and Backend should work simply by running **"npm install" followed by "npm run dev"** (to run the application) or **"npm run test"** (to run all tests).
- **DO NOT add additional instructions or Docker commands in the readme**, if anything else needs to be executed before starting the application, make sure to include it in your development script.
- **JavaScript files** are only allowed in lib configuration files, all your code MUST be in **TypeScript** and fully **typed**.
- **When you finish, deploy your code to a hosting service** like [Render](https://render.com/) or [Vercel](https://vercel.com/). You will be asked to provide the link to your repository and the link(s) to your deployed application(s) at the end, make sure to provide the root link without any path.

---

**Frontend Features**

- It must run on **port 4000**, and everything must be in the **"/"** route as a **single-page application (SPA)** using **React**.
- A button to **select a CSV file** from the local machine and another button **to upload the selected file**.
- A **search bar** that allows users to search data within the uploaded CSV file.
- The search bar should **update the displayed cards** to show only matching results.
- The uploaded CSV data should be displayed as **cards on the website**, with each card displaying all the data from a single row of the CSV file.
- **Responsive design** that works well on both desktop and mobile devices.
- **Clear and user-friendly error handling**.

**Backend Features**

- It must run on **port 3000**.
The backend must be implemented as a **RESTful API** using **Node**. **(DO NOT use any opinionated frameworks like Adonis or Nest)**.
- **The backend must include the following endpoints**:
  - **[POST /api/files]**
    - An endpoint that accepts the upload of a CSV file from the frontend and stores the data in a database or data structure. You must use the "file" key in the request body.
    - This route should return status 200 and an object with the "message" key with the value "The file was uploaded successfully".
    - Or this route should return status 500 and an object with the "message" key with an error message in the value.
  - **[GET /api/users]**
    - It should include an endpoint that allows the frontend to search through the uploaded CSV data. This route should accept a query parameter ?q= for search terms and should search in EVERY column of the CSV. 
    - The filter should search for partial matches and also be case-insensitive.
    - This route should return status 200 and an object with the "data" key with an array of objects inside it.
    - Or this route should return status 500 and an object with the "message" key with an error message in the value.

**Evaluation**

- We will evaluate your solution based on the following criteria:
  - Completeness of all required features and functionalities.
  - Code quality and organization.
  - Quality and coverage of automated tests.
  - User-friendliness and responsiveness of the frontend.
  - Performance and efficiency of the backend.
- Understanding the requirements is also part of the test. For any other issues, please contact xx@xxxxxxxxx.com for assistance.

**Good luck with your test!**
