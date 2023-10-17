// axios 公共配置
// 基地址

axios.defaults.baseURL = 'https://geek.itheima.net/'

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  token && (config.headers.Authorization = `Bearer ${token}`)
  return config
}, function (error) {
  return Promise.reject(error)
});

// 添加响应拦截器
axios.interceptors.response.use(response => {
  // Do something before response is sent
  const result = response.data
  return result;
}, error => {
  // Do something with response error
  if (error?.response?.status === 401) {
    alert('身份验证失败，请重新登录')
    localStorage.clear()
    location.href = '../login/index.html'
  }
  return Promise.reject(error);
});