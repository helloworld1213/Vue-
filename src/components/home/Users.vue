<template>
  <div class=''>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb> 
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable v-model="queryInfo.query" placeholder="请输入内容" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialog">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户数据列表展示 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template v-slot="scope">
            <!-- {{scope.row}} -->
            <!-- 开关 -->
            <el-switch v-model="scope.row.mg_state" active-color="#409eff"
              inactive-color="#dcdfe6" @change="stateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="scope">
            <el-tooltip :enterable="false" effect="dark" content="编辑" placement="top-start">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" effect="dark" content="删除" placement="top-start">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUsersById(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top-start">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="allotRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <!-- 改写 -->
      <pagination :total="total" :queryInfo="queryInfo" :get-data="getUserList"></pagination>
    </el-card>
    <!-- 点击编辑按钮添加编辑对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="resetEditDialog">
      <el-form :model="editRuleForm" :rules="editRuleFormRules" ref="editRuleFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input disabled v-model="editRuleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editRuleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editRuleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="resetAddUserDialog">
      <el-form :model="addRuleForm" :rules="addRuleFormRules" ref="addRuleFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addRuleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addRuleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addRuleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addRuleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="allotRolesDialogVisible"
      width="40%">
      <p>当前的用户: {{userInfo.username}}</p>
      <p class="setMargin">当前的角色: {{userInfo.role_name}}</p>
      <p>当前的用户: 
        <el-select v-model="selectedRoles" placeholder="请选择">
          <el-option
            v-for="(item, i) in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRolesConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '../other/Pagination.vue'
import request from '../../network/request'
export default {
  name: 'Users',
  components: {
    Pagination
  },
  data () {
    // 自定义邮箱和手机号的校验规则
    var checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if(regEmail.test(value)) {
          // 合法的邮箱
          return callback()
        }
        // 不合法
        callback(new Error('请输入正确的邮箱格式'))
      };
    var checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(regMobile.test(value)) {
          return callback()
        } else {
          callback(new Error('请输入正确的手机号格式'))
        }
      };
    return {
      //用户列表数据
      userList: [],
      //查询参数对象
      queryInfo: {
        query: '',
        pagesize: 2,
        pagenum: 1
      },
      //总条数
      total: 0,
      //控制编辑对话框的显示与隐藏
      //搜索框请求路径对象
      propsURL: {
        url: 'users',
        method: 'get',
        params: this.queryInfo
      },
      editDialogVisible: false,
      //校验规则对象
      editRuleForm: {
        //用户id
        id: '',
        username: '',
        email: '',
        mobile: '',
        //角色id
        role_id: ''//用户id和角色id都不需要校验,但是需要写出来,因为后面分配角色会用到
      },
      //校验规则
      editRuleFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validate: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validate: checkMobile, trigger: 'blur' }
        ],
      },
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //添加用户表单数据对象
      addRuleForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加用户表单校验规则对象
      addRuleFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validate: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validate: checkEmail, trigger: 'blur' }
        ],
      },
      //要编辑的用户的id
      rowId: '',
      //要在分配角色对话框弹出后渲染的数据
      userInfo: {},
      //控制分配角色对话框的显示与隐藏
      allotRolesDialogVisible: false,
      //获取的在下拉菜单中展示的角色列表
      rolesList: [],
      //选中的角色
      selectedRoles: ''

    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //获取用户列表数据
    async getUserList() {
      const {data: res} = await request({
        url: 'users',
        params: this.queryInfo
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取用户列表数据失败!')
      }
      console.log('获取用户列表数据成功!');
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //页面条数发生改变时的操作
    handleSizeChange(newSize) {
      //把选择的新的条数赋值给当前pagesize
      this.queryInfo.pagesize = newSize;
      //重新请求数据
      this.getUserList();
    },
    //页面页码发生改变时的操作
    handleCurrentChange(newNum) {
      //把选择的新的条数赋值给当前pagesize
      this.queryInfo.pagenum = newNum;
      //重新请求数据
      this.getUserList();
    },
    //状态改变数据库里面的状态也发生改变
    async stateChange(row) {
      const {data: res} = await request({
        url: `users/${row.id}/state/${row.mg_state}`,
        method: 'put'
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('修改用户状态数据失败!')
      }
      console.log('修改用户状态数据成功!');
    },
    //重置编辑用户表单
    resetEditDialog() {
      this.$refs.editRuleFormRef.resetFields()
    },
    //点击编辑按钮展示编辑对话框
    async editDialog(row) {
      this.rowId = row.id;
      // console.log(row);
      // console.log(this.rowId);
      //根据id获取编辑按钮已选中选项的数据
      const {data: res} = await request({
        url: `users/${row.id}`
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('修改表单数据失败!')
      }
      console.log('修改表单数据成功!');
      this.editRuleForm = res.data;
      this.editDialogVisible = true; 
    },
    //点击删除按钮根据id删除该条数据
    async deleteUsersById(row) {
      const result = await this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      // console.log(result);
      if(result !== 'confirm') {
        return this.$message.info('取消了删除操作')
      }
      const {data: res} = await request({
        url: `users/${row.id}`,
        method: 'delete'
      })
      if(res.meta.status !== 200) {
        return this.$message.error('删除用户列表数据失败!')
      }
      console.log('删除用户列表数据成功!');
      this.getUserList();
    },
    //点击展示添加用户对话框
    addUserDialog() {
      // console.log(this.addUserDialogMessage);
      this.addDialogVisible = true;
    },
    //重置添加用户表单
    resetAddUserDialog() {
      this.$refs.addRuleFormRef.resetFields();
    },
    //点击确定后添加新用户
    addUser() {
      //需要先校验表单
      this.$refs.addRuleFormRef.validate(async valid => {
        // console.log(valid)
        if(!valid) return;
        //发起请求
        const {data: res} = await request({
          url: 'users',
          method: 'post',
          data: this.addRuleForm
        })
        // console.log(res);
        if(res.meta.status !== 201) {
          return this.$message.error('添加新用户数据失败!')
        }
        console.log('添加新用户数据成功!');
        //请求成功,关闭对话框,重新渲染数据
        this.addDialogVisible = false;
        this.getUserList();
      })
    },
    //点击编辑用户确定按钮发送请求
    async editUser() {
      // console.log(this.rowId);
      const {data: res} = await request({
        url: `users/${this.rowId}`,
        method: 'put',
        data: this.editRuleForm
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('修改用户列表数据失败!')
      }
      console.log('修改用户列表数据成功!');
      //修改成功,关闭对话框
      this.editDialogVisible = false;
      //重新加载数据
      this.getUserList();
    },
    //分配角色(点击分配角色按钮立即请求角色列表数据:注意,是角色列表)
    async allotRoles(row) {
      // console.log(row);
      //先把用户信息保存起来,供渲染上面两个input的时候使用
      this.userInfo = row;

      const {data: res} = await request({
        url: 'roles',
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表数据失败!')
      }
      console.log('获取角色列表数据成功!');
      //把角色列表数据保存起来用于在下拉菜单中展示
      this.rolesList = res.data;

      this.allotRolesDialogVisible = true;
    },
    //确认分配角色
    async allotRolesConfirm() {
      // console.log(this.selectedRoles);
      if(!this.selectedRoles) {
        return this.$message.error('请选择要分配的角色')
      }
      const {data: res} = await request({
        url: `users/${this.userInfo.id}/role`,
        method: 'put',
        data: {rid: this.selectedRoles}
      })
      if(res.meta.status !== 200) {
        return this.$message.error('分配角色数据失败!')
      }
      console.log('分配角色数据成功!');
      this.getUserList();
      this.allotRolesDialogVisible = false;
    }
  }
}
</script>

<style lang='less' scoped>
  .setMargin {
    margin: 15px 0;
  }
  .el-select {
    width: 60%;
  }
</style>