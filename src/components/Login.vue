<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="login-avatar">
        <img src="../assets/images/logo.svg" alt="">
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px">
        <!-- 密码 -->
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            prefix-icon="iconfont icon-user"
            ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
          v-model="loginForm.password" 
          prefix-icon="iconfont icon-3702mima"
          type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 数据绑定
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证
      loginFormRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm() {
      // console.log(this);//可以从refs里面查看
      //this.$refs.resetLoginForm拿到的就是<el-form ref="loginFormRef">
      // 里的ref
      this.$refs.loginFormRef.resetFields();
    },
    // 表单登录前的预验证
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) {
          return;
        }
        //添加await得到的就是一个具体的promise对象
        // const result = await this.$http.post("login", this.loginForm);
        // console.log(result);
        const {data: res} = await this.$http.post("login", this.loginForm);
        if(res.meta.status !== 200) {
          return this.$message.error('登录失败,请重新输入');
        }
        this.$message.success('登录成功');
        //登录成功之后的操作
        /* 
        1. 将登录成功之后的token保存到客户端的sessionStorage中
          1.1 项目中除了登录之外的其他API接口,必须在登录之后才能访问
          1.2 token只应在当前网站打开其间生效,所以将token保存在
          sessionStorage中
        2.通过编程式导航跳转到后台主页,路由地址是/home
        */
       //1.
      //  console.log(res);
       window.sessionStorage.setItem("token", res.data.token);
      
      //2.
      this.$router.push("/home");
      })
    }
  }
}
</script>

<style  lang="less" scoped>
   .login-container {
     background-color: #2b4b6b;
     height: 100%;
     position: relative;
   }
   .login-box {
     width: 450px;
     height: 300px;
     background-color: #fff;
    
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    // 可以嵌套样式,应该是less的写法,即子元素的样式写到父元素里面
    .login-avatar {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px #ddd;
      padding: 10px;
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
   }

    .el-form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
    }
   .btns {
     display: flex;
     justify-content: flex-end;
   }
</style>