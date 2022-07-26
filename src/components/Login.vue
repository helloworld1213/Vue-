<template>
  <div class='login-container'>
    <div class="login-box">
      <div class="avatar">
        <img src="../assets/logo.png" alt="">
      </div>
      <div class="login-form">
        <el-form ref="loginFormRef" :rules="loginFormRules" :model="loginForm">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-users"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" @click="getToken">登录</el-button>
            <el-button type="info" @click="resetLoginBox">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../network/request'
export default {
  name: 'Login',
  data () {
    return {
      //登录表单对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //表单校验规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6到 15 个字符', trigger: 'blur' }
        ]
      },
    };
  },
  created() {
    //错误写法,不应该在这里调用函数,实例创建完,但是DOM还没有挂载,所以在
    //getToken()函数里面调用this.$refs.loginFormRef取不到值
    // this.getToken();
  },
  methods: {
    //获取token
    getToken() {
      //首先要验证是否填写了用户名和密码
      // console.log(this.$refs);
      //这里之所以取不到值,是因为getToken在
      // console.log(this.$refs.loginFormRef);
      this.$refs.loginFormRef.validate(async valid => {
        if(!valid) return;
        //验证过后的操作
        const {data: res} = await request({
          url: 'login',
          methods: 'post',
          params: this.loginForm
        })
        // console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error('获取token数据失败!')
        }
        console.log('获取token数据成功!');
        //保存token,并进入home页面
        window.sessionStorage.setItem('token', res.data.token);
        this.$router.push('/home')
      })
    },
    //点击重置按钮清空输入框
    resetLoginBox() {
      this.$refs.loginFormRef.resetFields();
    }
  }
}
</script>

<style lang='less' scoped>
  .login-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(43, 75, 107);

    .login-box {
      width: 450px;
      height: 300px;
      border-radius: 5px;
      background-color: #fff;
      position: relative;

      .avatar {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        border: 1px solid #eee;
        padding: 10px;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        box-shadow: 0 0 10px #ddd;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #eee;
        }
      }

      .el-form {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        position: absolute;
        bottom: 0;

        .btns {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
    
  }

  

  
</style>