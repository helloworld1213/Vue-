<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" 
              :key="item1.id"
              :class="['bdBottom', i1 === 0? 'bdTop' : '','vcenter']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRolesById(scope.row, item1.id)" 
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限区域 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" 
                  :key="item2.id"
                  :class="[i2 === 0? '' : 'bdTop','vcenter']">
                  <!-- 渲染二级嵌套权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable
                      @close="removeRolesById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级嵌套权限 -->
                  <el-col :span="18">
                    <el-tag v-for="(item3, i3) in item2.children"
                      type="warning"
                      :key="item3.id"
                      closable
                      @close="removeRolesById(scope.row, item3.id)"
                      >{{item3.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button 
              size="mini" 
              type="warning" 
              icon="el-icon-setting"
              @click="showSetRightsDialog(scope.row)">分配权限</el-button>
          </template>  
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClosed">
      <el-tree :data="rightsList" :props="rightsProp" 
        show-checkbox default-expand-all node-key="id"
        :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <!-- <el-button type="primary" @click="setRightsDialogVisible = false">确 定</el-button> -->
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      //所有角色列表数据
      rolesList: [],
      // isActive: '',
      //控制分配角色对话框的显示与隐藏
      setRightsDialogVisible: false,
      rightsList: [],
      rightsProp: {
        label: 'authName',
        children: 'children'
      },
      //默认选中的节点id值数组
      defKeys: [],
      //当前即将分配权限的角色id
      roleId: '',
    }
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      // console.log(this.$http.get('roles'));
      const {data: res} = await this.$http.get('roles');
      if(res.meta.status !== 200) {
        return this.$message.error("获取角色列表信息失败");
      }else {
        // console.log(res);
        this.rolesList = res.data;
      }
    },
    async removeRolesById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?','提示',
         {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      if(confirmResult !== 'confirm') {
        return this.$message.info("已取消删除");
      }else{
        // console.log("已删除权限");
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200) {
          return this.$message.error("删除权限失败");
        }else {
          // this.$message.success("删除权限成功");
          //防止重新刷新之后会回到首页,原来的页面关闭,所以把刷新后的数据
          //交给role.children,这样页面就不会刷新,只有数据刷新
          role.children = res.data;
        }
      }
    },
    async showSetRightsDialog(role) {
      //后面会用到
      this.roleId = role.id;
      //在更改显示与隐藏之前,先获得数据,这里我们需要的是树结构,所以type
      //直接写成tree就可以了
      // console.log(this.$http.get('rights/tree'));
      const {data: res} = await this.$http.get('rights/tree');
      if(res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败");
      }else {
        // console.log("获取权限成功");
        this.rightsList = res.data;

        //递归获取三级节点的id,通过role,也就是scope.row
        //同时,getLeafKeys里面有两个参数,第二个是接收的数组
        this.getLeafKeys(role, this.defKeys)
      }
      //把控制显示与隐藏的按钮改为true
      this.setRightsDialogVisible = true;
    },
    //通过递归的形式,获取角色下所有的三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      //如果node不包含children,则是三级节点(后台数据显示三级节点没有children)
      if(!node.children) {
        return arr.push(node.id);
      }else {
        //如果不是三级节点,则通过递归,获取到三级节点
        //循环当前的node所有的数组
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        });
        //然后就可以调用这个函数了,在点击分配权限按钮的时候调用
      }
    },
    //监听分配权限对话框关闭
    //同时,也要把defKeys清空,防止点击别的项目的时候被里面的数据干扰
    setRightsDialogClosed() {
      this.defKeys = [];
    },
    //分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys);
      //以逗号拼接
      const idStr = keys.join(',');
      // console.log(idStr);
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr,
      })
      if(res.meta.status !== 200) {
        return this.$message.error("获取权限失败");
      }else {
        //发送获取成功的消息
        // console.log("获取权限成功");
        this.$message.success("获取权限成功");
        //刷新数据
        this.getRolesList();
        //关闭弹框
        this.setRightsDialogVisible = false;
      }
    }
  },
  // computed: {
    //   isAddBorder() {
    //     return 'bdBottom', i1 === 0? 'bdTop': '';
    //   }
    // }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdTop {
    border-top: 1px solid #eee;
  }
  .bdBottom {
    border-bottom: 1px solid #eee;
  }
  // 定义一个类(居中的类),谁用到就给谁添加
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>