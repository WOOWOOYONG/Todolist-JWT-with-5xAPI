//form area
const loginForm = document.querySelector(".loginForm");
const signUpForm = document.querySelector(".signUpForm");

//login input
const loginEmail = document.querySelector(".loginEmail");
const loginPassword = document.querySelector(".loginPassword");

//sign up input
const signUpEmail = document.querySelector(".signUpEmail");
const signUpName = document.querySelector(".signUpname");
const signUpPassword = document.querySelector(".signUpPassword");
const checkPassword = document.querySelector(".checkPassword");

//buttons
const loginBtn = document.querySelector(".loginBtn");
const signUpBtn = document.querySelector(".signUpBtn");
const signUpPageBtn = document.querySelector(".signUpPageBtn");
const loginPageBtn = document.querySelector(".loginPageBtn");

//all inputs
const inputs = document.querySelectorAll("input");

//切換至註冊頁面
signUpPageBtn.addEventListener("click", () => {
  resetErrMsg();
  clearInput();
  loginForm.style.display = "none";
  signUpForm.style.display = "flex";
});

//回到登入頁面
loginPageBtn.addEventListener("click", () => {
  resetErrMsg();
  clearInput();
  loginForm.style.display = "flex";
  signUpForm.style.display = "none";
});

//切換頁面時清空輸入資料
const clearInput = () => {
  inputs.forEach((input) => {
    input.value = "";
  });
};

//API url
const url = "https://todoo.5xcamp.us";
const obj = {
  user: {},
};

//使用者註冊
const signUp = () => {
  obj.user.email = signUpEmail.value.trim();
  obj.user.nickname = signUpName.value.trim();
  obj.user.password = signUpPassword.value.trim();

  axios
    .post(`${url}/users`, obj)
    .then((res) => {
      alertify.notify(res.data.message, "success", 0.8);
      setTimeout(() => {
        location.reload();
      }, 900);
    })
    .catch((err) => {
      alertify.notify(err.response.data.message, "error", 2);
    });
};

signUpBtn.addEventListener("click", () => {
  if (
    signUpEmail.value == "" ||
    signUpPassword.value == "" ||
    signUpName == "" ||
    checkPassword == ""
  ) {
    alertify.alert("錯誤訊息", "請輸入正確資料");
  } else {
    checkSignUpForm();
    signUp();
  }
});

//使用者登入
const login = () => {
  obj.user.email = loginEmail.value;
  obj.user.password = loginPassword.value;
  axios
    .post(`${url}/users/sign_in`, obj)
    .then((res) => {
      token = res.headers.authorization;
      nickname = res.data.nickname;
      localStorage.setItem("userToken", token);
      localStorage.setItem("userNickname", nickname);
      alertify.notify(res.data.message, "success", 0.8);
      setTimeout(() => {
        redirect();
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
      alertify.notify(err.response.data.message, "error", 2);
    });
};

loginBtn.addEventListener("click", () => {
  if (loginEmail.value == "" || loginPassword.value == "") {
    alertify.alert("錯誤訊息", "請輸入正確資料");
  } else {
    checkLoginForm();
    login();
  }
});

//導向todo頁面
const redirect = () => {
  if (localStorage.getItem("userToken")) {
    location.href = "./todo.html";
  } else {
    console.log("no token");
  }
};

//表單驗證
let constraints = {
  loginEmail: {
    presence: {
      message: "^請輸入Email",
    },
    email: {
      message: "^不符合Email格式",
    },
  },
  loginPassword: {
    presence: {
      message: "^請輸入密碼",
    },
    length: {
      minimum: 6,
      message: "^密碼需大於6個字元",
    },
  },
  signUpEmail: {
    presence: {
      message: "^請輸入Email",
    },
    email: {
      message: "^不符合Email格式",
    },
  },
  signUpPassword: {
    presence: {
      message: "^請輸入密碼",
    },
    length: {
      minimum: 6,
      message: "^密碼需大於6個字元",
    },
  },
  nickname: {
    presence: {
      message: "^請輸入暱稱",
    },
  },
  confirmPassword: {
    presence: {
      message: "^請輸入正確密碼",
    },
    equality: {
      attribute: "signUpPassword",
      message: "^密碼錯誤",
    },
  },
};

//登入資料驗證
const checkLoginForm = () => {
  const errors = validate(loginForm, constraints);
  resetErrMsg();
  if (errors) {
    setErrMsg(errors);
  }
  console.log(errors);
};

//註冊資料驗證
const checkSignUpForm = () => {
  const errors = validate(signUpForm, constraints);
  resetErrMsg();
  if (errors) {
    setErrMsg(errors);
  }
  console.log(errors);
};

//清除錯誤提示
const resetErrMsg = () => {
  const errMsgs = document.querySelectorAll("span");
  errMsgs.forEach((err) => {
    err.innerHTML = "";
  });
};

//顯示錯誤提示
const setErrMsg = (errors) => {
  let errMsg;
  const nameList = Object.keys(errors);
  nameList.forEach((name) => {
    errMsg = document.querySelector(`.${name}-msg`);
    errMsg.innerText = errors[name];
  });
};
