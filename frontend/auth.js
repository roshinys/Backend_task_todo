const formUser = document.getElementById("userForm");
const addUser = document.getElementById("addUser");
const auth = document.getElementById("auth");
addUser.addEventListener("click", async (e) => {
  e.preventDefault();
  if (auth.innerText == "register") {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const result = await axios.post("http://localhost:5000/", {
      email: email,
      password: password,
    });
    if (result.status == 200) {
      window.location.href =
        "file:///C:/Users/roshi/Desktop/backendInterviewQuestions/BACKEND_TASK_ROSHIN/frontend/login.html";
    }
  } else {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log(email, password);
    const result = await axios.post("http://localhost:5000/loguser", {
      email: email,
      password: password,
    });
    if (result.status == 200) {
      localStorage.setItem("token", result.data.token);
      window.location.href =
        "file:///C:/Users/roshi/Desktop/backendInterviewQuestions/BACKEND_TASK_ROSHIN/frontend/todos.html";
    }
  }
});
