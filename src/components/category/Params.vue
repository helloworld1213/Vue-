<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数!"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="paramsList"
            :props="cascaderProps"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tag页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTagClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" 
            :disabled="isActive" @click="showDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" closable :key="i"
                  @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" 
                  @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="primary" 
                  icon="el-icon-edit" @click="editDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="small" type="danger" 
                  icon="el-icon-delete" @click="deleteEditDialog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" 
            :disabled="isActive" @click="showDialog">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" closable :key="i"
                  @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" 
                  @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="primary" 
                  icon="el-icon-edit" @click="editDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="small" type="danger" 
                icon="el-icon-delete" @click="deleteEditDialog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 点击动态参数/静态属性弹出对话框区域 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogvisible"
      width="50%"
      @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogvisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击编辑对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      //参数列表
      paramsList: [],
      cascaderProps: {
        //子级菜单触发方式,这里我们选择的是鼠标放上去触发子
        expandTrigger: 'hover',
        value: "cat_id",
        label:  "cat_name",
        children: "children"
      },
      //级联选择器双向绑定的数据
      selectedKeys: [],
      activeName: 'many',
      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],
      //控制动态参数对话框的显示与隐藏
      addDialogvisible: false,
      //添加参数的表单数据对象
      addForm: {
        attr_name: '',
      },
      //编辑对话框的显示与隐藏
      editDialogVisible: false,
      // //文本框的显示与隐藏
      // inputVisible: false,
      // //绑定的数据
      // inputValue: '',
      //修改参数的表单数据对象
      editForm: {
        attr_name: '',
      },
      //添加参数的表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入表单名称', trigger: 'blur' }
        ]
      },
      //修改参数的表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入表单名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getParamsList(); 
  },
  methods: {
    async getParamsList() {
      // console.log(this.$http.get('categories'));
      const {data: res} = await this.$http.get('categories');
      if(res.meta.status !== 200) {
        return this.$message.error("请求数据失败");
      }else {
        // console.log(res.data);
        this.paramsList = res.data;
      }

    },
    
    handleChange() {
      this.getParamsData();
    },
    //动态参数和静态属性之间的切换
    handleTagClick() {
      // console.log(this.activeName);
      this.getParamsData();
    },
    //实际上,不只是级联选择器发生变化,数据改变,而且动态参数和静态属性发生变化时,
    //数据也要变化,所以我们抽离出来一个函数,然后在上面的函数里面调用
    async getParamsData() {
      // console.log('111');
      //如果选中的不是三级分类(并且不是二级分类),清空数据
      // if(this.selectedKeys.length !== 3 && this.selectedKeys.length !== 2) {
      if(this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }else {
        //如果选中的是三级(或者二级分类),则进行打印
        // console.log(this.selectedKeys);
        //根据所选分类的id,和当前所处的面板,获取对应的参数
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: this.activeName}
        });
        // console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }else {

          //在这里拿到attr_vals的值
          // console.log(res.data);
          //先判断是不是空的,如果是,就返回一个空数组
          res.data.forEach(item => {
            // console.log(item);
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
            //控制文本框的显示与隐藏
            item.inputVisible = false;
            //文本框中输入的值
            item.inputValue = '';
          });

          //因为data里面既有动态参数的数据,也有静态属性的数据,所以我们做一下区分
          if(this.activeName === 'many') {
            this.manyTableData = res.data;
          }else {
            this.onlyTableData = res.data;
          }
        }
      }
    },
    showDialog() {
      // console.log('222');
      this.addDialogvisible = true;
    },
    //监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //添加参数确定按钮事件
    addParams() {
      //首先要验证
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) {
          return;
        }else {
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if(res.meta.status !== 201) {
            return this.$message.error("获取数据失败");
          }else {
            this.addDialogvisible = false;
            this.getParamsData();
            this.$message.success("获取数据成功");
          }
        }
      })
    },
    async editDialog(attr_id) {
      // this.attr_id = attr_id;
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {attr_sel: this.activeName}
      })
      if(res.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }else {
        this.$message.success("获取参数成功")
        this.editForm = res.data;
      }
      this.editDialogVisible = true;
    },
    editDialogClosed(attr_id) {
      this.$refs.editFormRef.resetFields();
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(this.editForm);
        if(!valid) {
          return ;
        }else {
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_sel: this.activeName,
            attr_name: this.editForm.attr_name	
          })
          console.log(res);
            if(res.meta.status !== 200) {
              return this.$message.error("编辑信息失败");
            }else {
              // console.log('编辑信息成功');
              this.$message.success("编辑信息成功");
              this.getParamsData();
              this.editDialogVisible = false;
            }
          }
      })
    },
    async deleteEditDialog(attr_id) {
      //删除前弹窗问一下
       const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        console.log(this.confirmResult);
        if(confirmResult !== 'confirm') {
          return this.$message.info("取消删除操作");
        }else {
          const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
          if(res.meta.status !== 200) {
            return this.$message.error("删除信息失败");
          }else {
            // console.log('333');
            this.$message.success("删除信息成功");
            this.getParamsData();
          }
        }
    },
    //失去焦点或者按下Enter键
    handleInputConfirm(row) {
      // console.log('ok');
      //在文本框失去焦点的时候,重新变回+newTag
      //同时,把不合法的内容(如空格等)清空
      if(row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }else {
        //合法,做其他操作
        //把文本框新加的东西添加到attr.vals中
        row.attr_vals.push(row.inputValue.trim());
        //添加完之后,失去焦点重新变成+newTag
        row.inputValue = '';
        row.inputVisible = false;
        //但是有一个问题,就是新增内容只是在页面展示了,
        //但是服务器里面并没有,重新刷新页面,还是没有展示
        //所以要发起请求提交到服务器
        // const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        //   attr_name: row.attr_name,
        //   attr_sel: row.attr_sel,
        //   //attr_vals是一个用空字符串分割的数组
        //   attr_vals: row.attr_vals.join(' ')
        // })
        // if(res.meta.status !== 200) {
        //   return this.$message.error("修改信息失败");
        // }else {
        //   this.$message.success("修改信息成功");
        // }
        //直接在这里调用封装好的函数即可
        this.saveAttrValues(row);
      }
    },
    //点击按钮,展示文本框
    showInput(row) {
      row.inputVisible = true;
      //$nextTick方法的作用:就是当页面上的元素
      //被重新渲染之后,才会执行回调函数中的代码
      this.$nextTick(_ => {
        //这行代码就是让文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //封装成下面这个函数
    async saveAttrValues(row) {
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          //attr_vals是一个用空字符串分割的数组
          attr_vals: row.attr_vals.join(' ')
        })
        if(res.meta.status !== 200) {
          return this.$message.error("修改信息失败");
        }else {
          this.$message.success("修改信息成功");
        }
    },
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      //删除之后,还要告诉服务器,所以,直接把
      //上面的代码拿过来就行,干脆我们直接封装
      //一下,反正两个地方都用到了
      this.saveAttrValues(row);
    }  
  },
  computed: {
    isActive() {
      return this.selectedKeys.length > 0 ? false : true;
    },
    //分类id
    cateId() {
      if(this.selectedKeys.length === 3) {
        return this.selectedKeys[2];
        console.log('111');
      }else if(this.selectedKeys.length === 2) {
        return this.selectedKeys[1];
      }else {
        return null;
      }
    },
    //根据选中决定是动态参数还是静态属性
    titleText() {
      if(this.activeName === 'many') {
        return  "动态参数";
      }else {
        return "静态属性";
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-tag {
    margin-right: 10px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>