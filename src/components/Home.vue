<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/images/huluwa.webp" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
  <el-container>
    <!-- 侧边栏 -->
    <el-aside :width="collpaseWidth">
      <div class="toggle-button" @click="toggleCollapse" >|||</div>
      <el-menu
        background-color="#333744"
        text-color="#fff"
        active-text-color="#409EFF"
        unique-opened
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        :default-active="activePath">
        <!-- 一级菜单 -->
        <el-submenu :index="item.id + ''" 
          v-for="item in menuList" 
          :key="item.id">
          <!-- 一级菜单的模板区域 -->
          <template slot="title">
            <!-- 图标 -->
            <i :class="listObj[item.id]"></i>
            <!-- 文本 -->
            <span>{{item.authName}}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item 
            :index="'/' + subItem.path" 
            v-for="subItem in item.children"
            @click="saveNavState('/' + subItem.path)">
            <!-- 图标 -->
            <i class="el-icon-menu"></i>
            <!-- 文本 -->
            <span>{{subItem.authName}}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!-- 右侧内容主体 -->
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      menuList: [],
      listObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao',
      },
      isCollapse: false,
      activePath: '',
    }
  },
  computed: {
    collpaseWidth() {
      return this.isCollapse ? '64px' : '200px';
    }
  },
  methods: {
    // 退出登录
    logout() {
      // 清空token
      window.sessionStorage.clear();
      // 路径跳转到登录页
      this.$router.push("/login");
    },
    //获取所有的菜单
    async getMenuList() {
      //promise对象
      // console.log(this.$http.get('menus'));
      //添加await就是一个具体的promise对象
      // console.log(await this.$http.get('menus'));
      //通过解构赋值把拿到的数据赋值给res
      const {data: res} = await this.$http.get('menus');
      // console.log(res);
      //把拿到的对象挂载到data里面的menuList里面
      //先判断数据是否成功拿到
      if(res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }else {
        this.menuList = res.data;
      }
    },
    //点击折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
     //保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      //重新赋值
      this.activePath = activePath;
    },
  },
  created() {
    //一进入就拿到左侧菜单栏列表数据
    this.getMenuList();

    this.activePath = window.sessionStorage.getItem('activePath');
  }
}
</script>

<style lang="less" scoped>
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #eaedf1;
    
    div {
      display: flex;
      align-items: center;
      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: 0;
    }
    .toggle-button {
      font-size: 12px;
      background-color: #4A5064;
      line-height: 24px;
      text-align: center;
      color: #fff;
      letter-spacing: 0.2em;
      cursor: pointer;

    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .home-container {
    height: 100%;
  }
  .iconfont {
    margin-right: 10px;
  }
</style>