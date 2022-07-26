<template>
  <div class=''>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb> 
    <!-- 卡片视图区域 -->
    <el-card>
      <div style="height:400px; overflow:auto">
        <el-table :data="rightsList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="authName" label="权限名称"></el-table-column>
          <el-table-column prop="path" label="路径"></el-table-column>
          <el-table-column prop="level" label="权限等级">
            <template v-slot="scope">
              <el-tag v-if="scope.row.level === '0'">一级</el-tag>
              <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
              <el-tag v-else type="warning">三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- <el-table :data="rightsList">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table> -->
    </el-card>
  </div>
</template>

<script>
import request from '../../network/request'
export default {
  name: 'Rights',
  data () {
    return {
      //权限列表数据
      rightsList: [],
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    //获取权限列表数据
    async getRightsList() {
      const {data: res} = await request({
        url: `rights/list`
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败!')
      }
      console.log('获取权限列表数据成功!');
      this.rightsList = res.data;
      // console.log(this.rightsList);
    }
  }
}
</script>

<style lang='less' scoped>
  
</style>