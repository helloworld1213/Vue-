<template>
  <div class='home-container'>
    <!-- 整体布局 -->
    <el-container>
      <!-- 头部区域 -->
      <el-header>
        <div class="left-content">
          <img src="../assets/images/calabashBrother.webp" alt="">
          <span>后台管理系统</span>
        </div>
        <el-button type="info" @click="logOut">退出</el-button>
      </el-header>
      <el-container>
        <!-- 侧边栏区域 -->
        <el-aside :width="controlCollapse ? '60px': '200px'">
          <!-- 顶部开关按钮 -->
          <div class="controlBtn" @click="controlChange">
            <i v-if="controlCollapse" class="el-icon-caret-right"></i>
            <i v-else class="el-icon-caret-left"></i>
          </div>
          <!-- 侧边菜单栏 -->
          <el-menu
            :default-active="activePath"
            background-color="#313743"
            text-color="#fff"
            active-text-color="#3582ff"
            :collapse-transition="false"
            unique-opened
            router
            :collapse="controlCollapse">
            <el-submenu :index="item.id + ''" v-for="(item, i) in menuList" :key="item.id">
              <template slot="title">
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" 
                :key="subItem.id" @click="showActivePath('/' + subItem.path)">
                <i class="el-icon-menu"></i>
                <span slot="title">{{subItem.authName}}</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <!-- 定义了路由之后还要在main里面使用 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import request from '../network/request'
export default {
  name: 'Home',
  data () {
    return {
      //侧边栏数据
      menuList: [],
      //icon全部防在这里,以便以后修改
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //控制开关的打开和闭合
      controlCollapse: false,
    };
  },
  created() {
    this.getMenuList();
    //当实例重新创建时,再把保存的活跃路径发送给当前路径
    //注意: 保存的路径必须是'/xxx',而不是'xxx',所以一直不起作用,上面index是
    //什么形式,就完整的保存下来就行
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //点击退出按钮退出登录
    logOut() {
      //点击退出后的操作
      //1.清空token
      window.sessionStorage.clear();
      //2.强制跳转到login页面
      this.$router.push('/login');
    },
    //获取用户数据列表数据
    async getMenuList() {
      const {data: res} = await request({
        url: 'menus',
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取用户数据列表失败!')
      }
      console.log('获取用户数据列表成功!');
      this.menuList = res.data;
    },
    //控制开关的打开和闭合
    controlChange() {
      this.controlCollapse = !this.controlCollapse;
    },
    //保存动态路径
    showActivePath(activePath) {
      // console.log(activePath);
      //把动态路径保存到sessionStorage中
      window.sessionStorage.setItem('activePath', activePath)
    }
  }
}
</script>

<style  lang='less' scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    width: 100%;
    height: 60px;
    background-color: rgb(53, 60, 63);
    //样式这里后面的分号一定不能丢掉,就这样的一个问题搞了我一天
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-content {
      display: flex;
      align-items: center;
      //这里不应该给left-content设置固定宽度,然后让img百分百,这样
      //span就没有位置了
      img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }
      span {
        color: #fff;
        margin-left: 15px;
      }
    }
  }

  //这里不能设置el-container为100%, 因为el-container里面还包含
  //着一个el-container
  // .is-container {
  //   height: 100%;
  // }
  //所以,只给第一个el-container添加高度
  .is-vertical {
    height: 100%;
  }

  .el-aside {
    background-color: rgb(49, 55, 67);

    .iconfont {
      margin-right: 10px;
    }

    .el-menu {
      border: none;
    }

    //按钮
    .controlBtn {
      color: #fff;
      display: flex;
      justify-content: center;
      line-height: 25px;
      background-color: #4a5064;
      letter-spacing: .2em;

      i {
        font-size: 25px;
      }
    }
  }
  .el-main {
    background-color: #fff;
  }
</style>