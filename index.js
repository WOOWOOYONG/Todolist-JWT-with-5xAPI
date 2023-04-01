//form area
const loginForm = document.querySelector('.loginForm');
const signUpForm = document.querySelector('.signUpForm');

//login input
const loginEmail = document.querySelector('.loginEmail');
const loginPassword = document.querySelector('.loginPassword');

//sign up input
const signUpEmail = document.querySelector('.signUpEmail');
const signUpName = document.querySelector('.signUpname');
const signUpPassword = document.querySelector('.signUpPassword');
const checkPassword = document.querySelector('.checkPassword');

//buttons
const loginBtn = document.querySelector('.loginBtn');
const signUpBtn = document.querySelector('.signUpBtn');
const signUpPageBtn = document.querySelector('.signUpPageBtn');
const loginPageBtn = document.querySelector('.loginPageBtn');

//切換至註冊頁面
signUpPageBtn.addEventListener('click', () => {
  resetErrMsg();
  loginForm.reset();
  loginForm.style.display = 'none';
  signUpForm.style.display = 'flex';
});

//回到登入頁面
loginPageBtn.addEventListener('click', () => {
  resetErrMsg();
  signUpForm.reset();
  loginForm.style.display = 'flex';
  signUpForm.style.display = 'none';
});

//API url
const url = 'https://todoo.5xcamp.us';
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
      alertify.notify(res.data.message, 'success', 0.8);
      setTimeout(() => {
        location.reload();
      }, 900);
    })
    .catch((err) => {
      alertify.notify(err.response.data.message, 'error', 2);
    });
};

signUpBtn.addEventListener('click', () => {
  if (
    signUpEmail.value === '' ||
    signUpPassword.value === '' ||
    signUpName.value === '' ||
    checkPassword.value === ''
  ) {
    checkLoginForm();
    alertify.alert('錯誤訊息', '請輸入正確資料');
  } else {
    checkSignUpForm();
  }
});

//使用者登入
const login = () => {
  obj.user.email = loginEmail.value.trim();
  obj.user.password = loginPassword.value.trim();
  axios
    .post(`${url}/users/sign_in`, obj)
    .then((res) => {
      token = res.headers.authorization;
      nickname = res.data.nickname;
      localStorage.setItem('userToken', token);
      localStorage.setItem('userNickname', nickname);
      alertify.notify(res.data.message, 'success', 0.8);
      setTimeout(() => {
        redirect();
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
      alertify.notify(err.response.data.message, 'error', 2);
    });
};

const handleLogin = () => {
  if (loginEmail.value === '' || loginPassword.value === '') {
    alertify.alert('錯誤訊息', '請輸入正確資料');
  } else {
    checkLoginForm();
  }
};

loginBtn.addEventListener('click', handleLogin);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleLogin();
  }
});

//導向todo頁面
const redirect = () => {
  if (localStorage.getItem('userToken')) {
    location.href = './todo.html';
  } else {
    console.log('no token');
  }
};

//validate.js 表單驗證

//註冊資料驗證
const signUpConstraints = {
  signUpEmail: {
    presence: {
      message: '^請輸入Email',
    },
    email: {
      message: '^不符合Email格式',
    },
  },
  signUpPassword: {
    presence: {
      message: '^請輸入密碼',
    },
    length: {
      minimum: 6,
      message: '^密碼需大於6個字元',
    },
  },
  nickname: {
    presence: {
      message: '^請輸入暱稱',
    },
  },
  confirmPassword: {
    presence: {
      message: '^請輸入正確密碼',
    },
    equality: {
      attribute: 'signUpPassword',
      message: '^密碼錯誤',
    },
  },
};

const checkSignUpForm = () => {
  const errors = validate(signUpForm, signUpConstraints);
  resetErrMsg();
  if (errors) {
    setErrMsg(errors);
  } else {
    signUp();
  }
};

//登入資料驗證

const loginConstraints = {
  loginEmail: {
    presence: {
      message: '^請輸入Email',
    },
    email: {
      message: '^不符合Email格式',
    },
  },
  loginPassword: {
    presence: {
      message: '^請輸入密碼',
    },
    length: {
      minimum: 6,
      message: '^密碼需大於6個字元',
    },
  },
};

const checkLoginForm = () => {
  const errors = validate(loginForm, loginConstraints);
  resetErrMsg();
  if (errors) {
    setErrMsg(errors);
  } else {
    login();
  }
};

//顯示錯誤提示
const setErrMsg = (errors) => {
  // let errMsg;
  const nameList = Object.keys(errors);
  // nameList.forEach((name) => {
  //   errMsg = document.querySelector(`.${name}-msg`);
  //   errMsg.innerText = errors[name];
  // });
  for (const name of nameList) {
    const errMsg = document.querySelector(`.${name}-msg`);
    errMsg.innerText = errors[name];
  }
};

//清除錯誤提示
const resetErrMsg = () => {
  const errMsgs = document.querySelectorAll('span');
  // errMsgs.forEach((err) => {
  //   err.innerHTML = '';
  // });
  for (const err of errMsgs) {
    err.innerHTML = '';
  }
};
