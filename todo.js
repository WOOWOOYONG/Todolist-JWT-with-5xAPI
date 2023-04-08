const add_input = document.querySelector('.add_input');
const add_btn = document.querySelector('.add_btn');
const listArea = document.querySelector('.list');
const tab = document.querySelector('.tab');
const todoTabs = document.querySelectorAll('.tabState');
const clear_btn = document.querySelector('.clear_btn');
const remainingArea = document.querySelector('.remaining');
const title = document.querySelector('.title');
const logoutBtn = document.querySelector('.logout');
const todoContent = document.querySelector('.content');
let tabStatus = 'all';

//API url
const url = 'https://todoo.5xcamp.us';
let nickname = '';
let token = '';
let todos = [];
token = localStorage.getItem('userToken');
const config = {
  headers: {
    Authorization: token,
  },
};
nickname = localStorage.getItem('userNickname');

//渲染待辦清單
const renderTodo = (todos) => {
  // let str = "";
  // todos.forEach((item) => {
  //   str += `<li>
  //       <label for="" class="checkbox">
  //         <input type="checkbox" data-id="${item.id}"
  //         ${item.completed_at ? "checked" : ""}/>
  //         <span>${item.content}</span>
  //       </label>
  //       <button class="delete_btn" data-id="${item.id}">
  //         <i class="fa-solid fa-xmark" data-id="${item.id}"></i>
  //       </button>
  //     </li>`;
  // });
  // listArea.innerHTML = str;
  if (todos.length === 0 && tabStatus !== 'done') {
    listArea.innerHTML = `<h2 class='noTodo'>目前無待辦事項!</h2>`;
    return;
  }
  const items = todos.map((item) => {
    const { id, completed_at, content } = item;
    return `<li>
        <label for="" class="checkbox">
          <input type="checkbox" data-id="${id}" 
          ${completed_at ? 'checked' : ''}/>
          <span>${content}</span>
        </label>
        <button class="delete_btn" data-id="${id}">
          <i class="fa-solid fa-xmark" data-id="${id}"></i>
        </button>
      </li>`;
  });
  listArea.innerHTML = items.join('');
};

//取得待辦清單
const getTodo = () => {
  axios
    .get(`${url}/todos`, config)
    .then((res) => {
      todos = res.data.todos;
      renderTodo(todos.reverse());
      countUndone(todos);
      setTodobyStatus(tabStatus);
    })
    .catch((err) => console.log(err));
};

//新增待辦事項
const addTodo = (todo) => {
  if (add_input.value.trim() === '') {
    alertify.alert('錯誤訊息', '請先輸入資料');
    return;
  }
  axios
    .post(
      `${url}/todos`,
      {
        todo: {
          content: todo,
        },
      },
      config
    )
    .then(() => {
      alertify.notify('已新增', 'success', 1);
      getTodo();
      add_input.value = '';
      //新增後回到'全部'頁籤
      resetTodoTabs();
    })
    .catch((err) => console.log(err.response));
};

add_btn.addEventListener('click', () => {
  const newTodo = add_input.value;
  addTodo(newTodo);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const newTodo = add_input.value;
    addTodo(newTodo);
  }
});

//刪除待辦事項
const deleteTodo = (todoId) => {
  axios
    .delete(`${url}/todos/${todoId}`, config)
    .then((res) => {
      alertify.notify(res.data.message, 'warning', 1);
      getTodo();
    })
    .catch((err) => console.log(err.response));
};

listArea.addEventListener('click', (e) => {
  if (
    e.target.getAttribute('class') === 'delete_btn' ||
    e.target.getAttribute('class') === 'fa-solid fa-xmark'
  ) {
    const todoId = e.target.getAttribute('data-id');
    deleteTodo(todoId);
  }
});

//切換待辦事項完成狀態，重新getTodo會導致順序錯亂
// const toggleTodo = (id) => {
//   axios
//     .patch(`${url}/todos/${id}/toggle`, {}, config)
//     .then((res) => {
//       if (res.status === 200) {
//         getTodo();
//       }
//     })
//     .catch((err) => console.log(err));
// };

//只接收回傳更新狀態後的該筆待辦事項，加入本地的todos陣列，維持排序
const toggleTodo = (id) => {
  const selectTodo = todos.filter((todo) => {
    return todo.id === id;
  })[0];
  axios
    .patch(`${url}/todos/${id}/toggle`, {}, config)
    .then((res) => {
      if (res.status === 200) {
        todos.splice(todos.indexOf(selectTodo), 1, res.data);
      }
    })
    .then(() => {
      renderTodo(todos);
      countUndone(todos);
      setTodobyStatus(tabStatus);
    })
    .catch((err) => console.log(err));
};

//防止待辦事項切換狀態過於頻繁
const delayedClick = () => {
  listArea.classList.add('notActive');
  todoContent.classList.add('notAllow');
  setTimeout(() => {
    listArea.classList.remove('notActive');
    todoContent.classList.remove('notAllow');
  }, 400);
};

listArea.addEventListener('click', (e) => {
  if (
    e.target.getAttribute('class') !== 'delete_btn' &&
    e.target.getAttribute('class') !== 'fa-solid fa-xmark'
  ) {
    const selectId = e.target.getAttribute('data-id');
    if (selectId) {
      delayedClick();
      toggleTodo(selectId);
    }
  }
});

const clearDoneItem = () => {
  if (todos.length > 0) {
    doneTodos = todos.filter((todo) => {
      return todo.completed_at !== null;
    });
    if (doneTodos.length > 0) {
      alertify.notify('已清除所有完成事項', 'warning', 1);
      axios.all(
        doneTodos.map((item) => {
          axios
            .delete(`${url}/todos/${item.id}`, config)
            .then((res) => {
              //因為使用axios.all刪除所有已完成事項後
              //會再執行一次getTodo從server拿到新的todos
              //就不需要再更新本地端的todos
              // doneTodos.forEach((item) => {
              //   todos.splice(todos.indexOf(item), 1);
              // });
              if (res.status === 200) {
                getTodo();
              }
            })
            .catch((err) => console.log(err.response));
        })
      );
      //清除後回到'全部‘頁籤
      resetTodoTabs();
      setTodobyStatus(tabStatus);
    } else {
      alertify.notify('目前沒有完成事項', 'warning', 1);
    }
  } else {
    alertify.notify('目前沒有待辦事項', 'warning', 1);
  }
};

//清除已完成事項
clear_btn.addEventListener('click', clearDoneItem);

//計算剩餘未完成事項
const countUndone = (todos) => {
  const undoneNum = todos.filter((todo) => {
    return todo.completed_at === null;
  }).length;
  if (undoneNum === 0) {
    remainingArea.textContent = `沒事多喝水`;
    return;
  }
  remainingArea.textContent = `${undoneNum} 個待完成`;
};

//根據完成狀態頁籤來切換待辦事項
const setTodobyStatus = (status) => {
  switch (status) {
    case 'undone':
      const undoneList = todos.filter((todo) => todo.completed_at === null);
      renderTodo(undoneList);
      break;

    case 'done':
      const doneList = todos.filter((todo) => todo.completed_at !== null);
      console.log(todos);
      if (todos.length === 0) {
        listArea.innerHTML = `<h2 class='noTodo'>目前你一事無成</h2>`;
      } else {
        renderTodo(doneList);
      }

      break;

    default:
      renderTodo(todos);
  }
};

//依選取狀態顯示待辦清單
tab.addEventListener('click', (e) => {
  if (e.target.nodeName === 'UL') {
    return;
  }
  changeTab(e);
});

//重置Todo頁籤
const resetTodoTabs = () => {
  for (const tab of todoTabs) {
    tab.classList.remove('active');
  }
  todoTabs[0].classList.add('active');
  tabStatus = 'all';
};

const changeTab = (e) => {
  const selectedTab = e.target.dataset.state;
  // todoTabs.forEach((tab) => {
  //   tab.classList.remove('active');
  // });
  for (const tab of todoTabs) {
    tab.classList.remove('active');
  }
  e.target.classList.add('active');
  tabStatus = selectedTab;
  setTodobyStatus(tabStatus);
  countUndone(todos);
};

//登出
const logout = () => {
  axios
    .delete(`${url}/users/sign_out`, config)
    .then((res) => {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userNickname');
      alertify.notify(res.data.message, 'success', 0.8);
      setTimeout(() => {
        redirect();
      }, 900);
    })
    .catch((err) => {
      console.log(err);
      alertify.alert('錯誤訊息', '登出失敗');
    });
};

logoutBtn.addEventListener('click', logout);

//初始化
const init = () => {
  if (!localStorage.getItem('userToken')) {
    redirect();
  } else {
    title.innerText = `哈囉~ ${nickname} 來做點事吧!`;
    getTodo();
  }
};

const redirect = () => {
  location.href = 'index.html';
};

init();
