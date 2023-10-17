/**
 * 目标1：设置频道下拉菜单
 *  1.1 获取频道列表数据
 *  1.2 展示到下拉菜单中
 */

function setChannels() {
  axios({
    url: '/v1_0/channels',
  }).then(result => {
    const channels_str = result.data.channels.map(item => {
      return `<option value="${item.id}">${item.name}</option>`
    })
    document.querySelector(".form-select").innerHTML = '<option value="" selected>请选择文章频道</option>' + channels_str
  })
}
setChannels()


/**
 * 目标2：文章封面设置
 *  2.1 准备标签结构和样式
 *  2.2 选择文件并保存在 FormData
 *  2.3 单独上传图片并得到图片 URL 网址
 *  2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
 */

document.querySelector('.img-file').addEventListener('change', e => {
  const file = e.target.files[0]
  const fd = new FormData()
  fd.append('image', file)
  axios({
    url: '/v1_0/upload',
    method: 'POST',
    data: fd
  }).then(result => {
    const img_url = result.data.url
    document.querySelector('.place').classList.add('hide')
    document.querySelector('.rounded').src = img_url
    document.querySelector('.rounded').classList.add('show')
  })
})

document.querySelector('.rounded').addEventListener('click', () => {
  document.querySelector('.place').click()
})

/**
 * 目标3：发布文章保存
 *  3.1 基于 form-serialize 插件收集表单数据对象
 *  3.2 基于 axios 提交到服务器保存
 *  3.3 调用 Alert 警告框反馈结果给用户
 *  3.4 重置表单并跳转到列表页
 */

document.querySelector('.send').addEventListener('click', e => {
  if (e.target.innerHTML !== '发布') return
  const form = document.querySelector('.art-form')
  const data = serialize(form, { hash: true, empty: true })
  delete data.id
  data.cover = {
    type: 1,
    images: [document.querySelector('.rounded').src]
  }
  axios({
    url: '/v1_0/mp/articles',
    method: 'POST',
    data
  }).then(result => {
    myAlert(true, '发表成功')
    form.reset()
    setTimeout(() => {
      location.href = '../content/index.html'
    }, 1500)
  }).catch(error => {
    myAlert(false, error.response.data.message)
  })
})

/**
 * 目标4：编辑-回显文章
 *  4.1 页面跳转传参（URL 查询参数方式）
 *  4.2 发布文章页面接收参数判断（共用同一套表单）
 *  4.3 修改标题和按钮文字
 *  4.4 获取文章详情数据并回显表单
 */

!(function () {
  const params_str = location.search
  const params_obj = new URLSearchParams(params_str)
  params_obj.forEach((value, key) => {
    if (key === 'id') {
      document.querySelector('.title').innerHTML = '修改文章'
      document.querySelector('.send').innerHTML = '修改'
      // 数据回显
      axios({
        url: `/v1_0/mp/articles/${value}`,
      }).then(result => {
        console.log(result)
        const { channel_id, title, content, id } = result.data
        const data_obj = {
          channel_id,
          title,
          content,
          id,
          rounded: result.data.cover.images[0]
        }
        Object.keys(data_obj).forEach(key => {
          if (key === 'rounded') {
            if (data_obj[key]) {
              document.querySelector('.place').classList.add('hide')
              document.querySelector('.rounded').src = data_obj[key]
              document.querySelector('.rounded').classList.add('show')
            }
          } else if (key === 'content') {
            editor.setHtml(data_obj[key])
          } else {
            document.querySelector(`[name=${key}]`).value = data_obj[key]
          }
        })
      })
    }
  })
})()

/**
 * 目标5：编辑-保存文章
 *  5.1 判断按钮文字，区分业务（因为共用一套表单）
 *  5.2 调用编辑文章接口，保存信息到服务器
 *  5.3 基于 Alert 反馈结果消息给用户
 */

document.querySelector('.send').addEventListener('click', e => {
  if (e.target.innerHTML !== '修改') return
  const form = document.querySelector('.art-form')
  const data = serialize(form, { hash: true, empty: true })
  console.log(data)
  axios({
    url: `/v1_0/mp/articles/${data.id}`,
    method: 'PUT',
    data: {
      ...data,
      cover: {
        type: document.querySelector('.rounded').src ? 1 : 0,
        images: [document.querySelector('.rounded').src]
      }
    }
  }).then(result => {
    console.log(result)
    myAlert(true, '修改成功')
    setTimeout(() => {
      location.href = '../content/index.html'
    }, 1500)
  }).catch(error => {
    myAlert(false, error.response.data.message)
  })
})