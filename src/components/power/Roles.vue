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
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- table表格 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- {{scope.row}} -->
            <!-- 一级分类 -->
            <el-row :class="[i1 === 0 ? 'btop' : '', 'bbottom', 'vcenter']" v-for="(item, i1) in scope.row.children" :key="item.id">
              <!-- {{i1}} -->
              <el-col :span="5">
                <el-tag>{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级和三级分类 -->
                <el-row :class="[i2 === 0 ? '' : 'btop', 'vcenter']" v-for="(item1, i2) in item.children" :key="item1.id">
                  <!-- {{i2}} -->
                  <el-col :span="6">
                    <el-tag type="success">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag 
                      closable 
                      v-for="item2 in item1.children" 
                      :key="item2.id" 
                      type="warning"
                      @close="deleteRolesTag(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 编辑按钮 -->
            <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top-start">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="editRolesDialog(scope.row)"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top-start">
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRoles(scope.row)"></el-button>
            </el-tooltip>
            <!-- 分配权限按钮 -->
            <el-tooltip :enterable="false" class="item" effect="dark" content="分配权限" placement="top-start">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="allotRightsDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="resetAddRolesForm">
      <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="resetEditRolesDialog">
      <el-form :model="editRuleForm" :rules="editRuleFormRules" ref="editRuleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRuleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRuleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="allotRightsDialogVisible"
      width="50%">
      <el-tree
        ref="allotRightsRef"
        :data="allotRights"
        :props="rightsProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        :default-expand-all="true">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRightsConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
export default {
  name: 'Role',
  data () {
    return {
      //角色列表
      rolesList: [],
      //控制添加角色对话框的显示与隐藏
      addRolesDialogVisible: false,
      //添加角色校验对象
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      //添加角色校验规则
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      //控制编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      //编辑角色对象
      editRuleForm: {
        roleName: '',
        roleDesc: ''
      },
      //编辑角色校验规则对象
      editRuleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      //选择要编辑的用户的id
      rowId: '',
      //控制分配权限对话框的显示与隐藏
      allotRightsDialogVisible: false,
      //分配权限数据
      allotRights: [],
      //权限配置对象
      rightsProps: {
        label: 'authName',
        children: 'children'
      },
      //默认勾选的节点的 key 的数组
      defKeys: [],
      //角色id
      roleId: ''
    };
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取角色列表数据
    async getRolesList() {
      const {data: res} = await request({
        url: 'roles'
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表数据失败!')
      }
      console.log('获取角色列表数据成功!');
      this.rolesList = res.data;
    },
    //控制添加角色对话框的显示与隐藏
    addRolesDialog() {
      this.addRolesDialogVisible = true;
    },
    //重置表单
    resetAddRolesForm() {
      this.$refs.addRolesFormRef.resetFields()
    },
    //添加角色确认按钮
    addRoles() {
      //需要先校验
      this.$refs.addRolesFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return;

        const {data: res} = await request({
          url: 'roles',
          method: 'post',
          data: this.addRolesForm
        })
        // console.log(res);
        if(res.meta.status !== 201) {
          return this.$message.error('添加角色数据失败!')
        }
        console.log('添加角色数据成功!');
        this.addRolesDialogVisible = false;
        this.getRolesList();
      })
    },
    //点击编辑用户
    async editRolesDialog(row) {
      // console.log(row.id);
      this.rowId = row.id;
      // console.log(this.rowId);
      //根据id查询角色
      const {data: res} = await request({
        url: `roles/${row.id}`
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色对象数据失败!')
      }
      console.log('获取角色对象数据成功!');
      this.editRuleForm = res.data;

      this.editDialogVisible = true;
    },
    //编辑按钮重置事件
    resetEditRolesDialog() {
      this.$refs.editRuleFormRef.resetFields()
    },
    //点击提交编辑的用户
    editDialog() {
      //也是需要先校验
      this.$refs.editRuleFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) reutrn;
        const {data: res} = await request({
          url: `roles/${this.rowId}`,
          method: 'put',
          data: this.editRuleForm
        })
        if(res.meta.status !== 200) {
          return this.$message.error('修改角色信息数据失败!')
        }
        console.log('修改角色信息数据成功!');
        this.editDialogVisible = false;
        this.getRolesList();
      })
    },
    //删除角色
    async deleteRoles(row) {
      const deleteResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(deleteResult);
      if(deleteResult !== 'confirm') {
        return this.$message.info('取消了删除角色的操作!');
      }
      //删除角色并告知数据库
      const {data: res} = await request({
        url: `roles/${row.id}`,
        method: 'delete'
      })
      if(res.meta.status !== 200) {
        return this.$message.error('删除选中角色数据失败!')
      }
      console.log('删除选中角色数据成功!');
      this.getRolesList();
    },
    //分配权限对话框
    async allotRightsDialog(role) {
      // console.log(role);
      //保存角色id供确认添加权限函数allotrightsConfirm()使用
      this.roleId = role.id;
      //先获取分配权限的数据
      const {data: res} = await request({
        url: `rights/tree`,
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取分配权限数据失败!')
      }
      console.log('获取分配权限数据成功!');
      this.allotRights = res.data;
      //现在点击扩展按钮有数据了,但是分配选线对话框打开,并没有与之相对的选中状态
      //在这里使用getKeys函数
      this.getKeys(role, this.defKeys)
      //可以看到,现在分配权限对话框有了对应的选中的数据的展示

      this.allotRightsDialogVisible = true;
    },
    //选中三级分配权限(递归拿到)
    getKeys(node, arr) {
      //没有包含children,则是三级权限
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getKeys(item, arr)
      });

    },
    //确认分配权限并发送到数据库
    async allotRightsConfirm() {
      //获取keys
      //通过给tree添加ref然后可以拿到这个对象,然后调用
      //获取全选和半选中的key作为数组,不用获取nodes是因为
      //nodes获取的是节点,分不清的话打印出来看一下
      const keys = [
        // ...this.$refs.allotRightsRef.getCheckedNodes()
        ...this.$refs.allotRightsRef.getCheckedKeys(),
        ...this.$refs.allotRightsRef.getHalfCheckedKeys()

      ]
      // console.log(keys);
      //权限列表要求的是以逗号分割的字符串,所以要做一下处理
      // keys = keys.join(',')
      //不要直接赋值给keys,会报错keys是只读属性
      const idStr = keys.join(',')
      // console.log(this.roleId);//这里就有数据了
      const {data: res} = await request({
        url: `roles/${this.roleId}/rights`,
        method: 'post',
        data: {rids: idStr}
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('给角色授权失败!')
      }
      console.log('给角色授权成功!');
      this.getRolesList();
      this.allotRightsDialogVisible = false;
    },
    //确认删除权限标签
    async deleteRolesTag(role, rightId) {
      //这里一定要记得把点击删除的那一项的id传递过来
      // console.log(role);
      // console.log(rightId);

      //先询问是否确认删除
      const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(result);
      if(result !== 'confirm') {
        return this.$message.info('取消了删除权限的操作!')
      }

      const {data: res} = await request({
        url: `roles/${role.id}/rights/${rightId}`,
        method: 'delete'
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      console.log('删除权限成功!');
      role.children = res.data;
    }
  }
}
</script>

<style lang='less' scoped>
  .el-tag {
    margin: 7px;
  }
  .btop {
    border-top: 1px solid #eee;
  }
  .bbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>