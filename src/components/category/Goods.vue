<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框区域 :gutter加在el-row上才起作用 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query"
            clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 数据列表区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" width="50px"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作"  width="125px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete"
             size="mini" @click="showDeleteDialog(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 6, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>
    <!-- 弹出删除对话框 -->
    <!-- 直接使用messageBox,不需要dialog -->
  </div>
</template>

<script>
export default {
  name: 'Goods',
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //分页商品数据
      goodsList: [],
      //总条数
      total: 0,
      //控制删除对话框的显示与隐藏
      deleteDialogVisible: false,
    }
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      // console.log(this.$http.get('goods'));
      const {data: res} = await this.$http.get('goods', {
        params: this.queryInfo
      });
      if(res.meta.status !== 200) {
        return this.$message.error("请求数据失败");
      }else {
        // this.$message.success("获取数据成功");
        // console.log(res);
        this.goodsList = res.data.goods;
        this.total = res.data.total;
      }
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    async showDeleteDialog(id) {
       const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if(confirmResult !== 'confirm') {
          return this.$message.info("已经取消删除");
        }else {
          // console.log('111');
          const {data: res} = await this.$http.delete(`goods/${id}`)
          if(res.meta.status !== 200) {
            return this.$$message.error("删除商品信息失败");
          }else {
            this.$message.success("删除商品信息成功");
            this.getGoodsList();
          }
        }
    },
    //点击添加商品按钮,跳转到添加商品路由
    goAddPage() {
      this.$router.push('/goods/add');
    }
  }
}
</script>

<style lang="less" scope>
  
</style>