<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 顶部添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <tree-table class="treeTable" :data="categoriesList" :columns="columns"
        :selection-type="false" :expand-type="false"
        show-index index-text="#"
        :show-row-hover="false">
        <!-- 是否有效 -->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" 
              v-if="scope.row.cat_deleted === false"
              style="color: lightgreen;"></i>
            <i class="el-icon-error" v-else
              style="color: red;"></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" type="primary" 
              v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" 
              v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" 
              size="small">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" 
              size="small">删除</el-button>
          </template>
        </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类弹出框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!-- 添加分类 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" 
        ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options指定数据源 clearable清空选项,鼠标
            移动到框框末尾处会有一个叉号 级联选择器默认只能
            选中最后一级,如何只选择前面的呢?通过change-on-select
            -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentList"
              :props="cascaderProps"
              @change="parentCateChange"
              clearable>
            </el-cascader>
            
          </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'Categories',
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        //当前页数
        pagenum: 1,
        //每页数据条数
        pagesize: 5
      },
      //获取的商品的数据
      categoriesList: [],
      //数据总条数
      total: 0,
      //控制点击添加分类对话框的显示与隐藏
      addDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        //将要添加的分类的名称
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //分类的等级,默认添加的是1级
        cat_level: 0
      },
      //父级分类数据接收
      parentList: [],
      //定义配置对象
      cascaderProps: {
        //子级菜单触发方式,这里我们选择的是鼠标放上去触发子
        expandTrigger: 'hover',
        value: "cat_id",
        label:  "cat_name",
        children: "children"
      },
      //选中的父级分类的id
      selectedKeys: [],
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ]
      },
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //表示将当前定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          //表示将当前定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          //表示将当前定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'opt'
        },
      ]
    }
  },
  created() {
    this.getCategoriesList();
  },
  methods: {
    async getCategoriesList() {
      const {data: res} = await this.$http.get('categories', {
        params: this.queryInfo
      });
      if(res.meta.status !== 200) {
        return this.$message.error("请求分类数据失败");
      }else {
        // console.log(res);
        this.categoriesList = res.data.result;
        this.total = res.data.total;
      }
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCategoriesList();
    },
    //监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCategoriesList();
    },
    //点击添加分类弹出对话框
    addDialog() {
      //对话框弹出前,父级数据必须拿到,所以在这里调用函数
      this.getParentList();

      this.addDialogVisible = true;
    },
    //获取父级分类对话框的数据列表
    async getParentList() {
      const {data: res} = await this.$http.get('categories', {
        params: {type: 2}
      })
      if(res.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }else {
        // console.log("success");
        //请求数据成功,要有接收得到东西
        this.parentList = res.data;
      }
      //同时,这个getParentList函数设置了,但是还没有调用
      //在哪里调用?在点击添加分类的时候就必须获得数据,所以
      //在点击添加分类函数里使用
    },
    //选择项发生变化触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys);
      //如果selectedKeys打印的id为0,说明没有选中父级
      //反之,如果不为0, 则表面选中了父级id
      if(this.selectedKeys.length > 0) {
        // console.log('111');
        //如果不为0,父级分类的id就是数组的最后一项
        //不管是选中的是第一级还是第二级
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      }else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //点击确定添加分类
    addForm() {
      // console.log(this.addCateForm);
      //validate函数:表单验证,如果表单合法,返回valid,
      //如果不合法,则提示完整填写表单
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) {
          return;
        }else {
          //我们这里是如果合法,就开始请求数据
          const {data: res} = await this.$http.post('categories', this.addCateForm);
          // console.log(res);
          if(res.meta.status !== 201) {
            return this.$message.error("添加分类失败");
          }else {
            this.$message.success("添加分类成功");
            this.getCategoriesList();
            this.addDialogVisible = false;
          }
        }
      })
    },
    //关闭添加分类对话框
    addDialogClosed() {
      //重置表单数据
      //console.log(this.$refs.addCateFormRef);
      this.$refs.addCateFormRef.resetFields();
      //重置底部选中的那个表单
      this.selectedKeys = [];
      //还有选中了之后点击确定,通过打印的数据可以看到
      //cat_level和cat_pid并没有清空
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    }
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
